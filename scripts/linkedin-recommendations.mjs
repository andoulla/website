#!/usr/bin/env node
// One-off conversion utility — not part of the app build/lint/type-check surface.
//
// Converts the "Recommendations_Received.csv" file from a LinkedIn data export
// (Settings -> Data privacy -> Download my data) into the
// src/data/recommendations.json shape used by loadExperiences.
//
// Recommenders' full names are read from the CSV but never written to the
// output — only their initials are stored, since this file is committed to a
// public repo.
//
// Job matching uses scripts/recommender-map.json, keyed by an 8-char SHA1 of
// each recommender's normalised full name (privacy-preserving, stable across
// re-imports). For any recommender not yet in the map the script prompts
// interactively and saves the answer back to the map so future imports don't
// ask again. Pick 0 to leave a jobId empty and fill it in manually later.
//
// Usage:
//   yarn import:rec <path-to-Recommendations_Received.csv> [outputPath]
//
// Defaults outputPath to src/data/recommendations.json.

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline';

import { parseCsv } from './lib/csv.mjs';
import { slugify, uniqueId } from './lib/slug.mjs';

const MAP_PATH = 'scripts/recommender-map.json';

// "MM/DD/YY, HH:MM AM/PM" (new, e.g. "05/18/26, 09:25 AM") or legacy "M/D/YYYY" -> "YYYY-MM-DD".
function parseCreationDate(value) {
  const trimmed = value.trim();
  const newMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{2}),\s+\d{1,2}:\d{2}\s+[AP]M$/.exec(trimmed);
  if (newMatch !== null) {
    const [, month, day, year2] = newMatch;
    return `20${year2}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (match === null) {
    throw new Error(`Unrecognized LinkedIn date format: "${value}"`);
  }
  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// First+Last name -> "A.B." initials. Uses the first Unicode letter in each name,
// skipping any leading emoji or non-letter characters. The full name itself is never captured.
function toInitials(firstName, lastName) {
  const firstLetter = (name) => Array.from(name.trim()).find((c) => /\p{L}/u.test(c)) ?? '';
  return `${firstLetter(firstName).toUpperCase()}.${firstLetter(lastName).toUpperCase()}.`;
}

// 8-char SHA1 of the lowercased full name — stable identifier that never stores the real name.
function nameKey(firstName, lastName) {
  const normalized = `${firstName.trim()} ${lastName.trim()}`.toLowerCase();
  return createHash('sha1').update(normalized).digest('hex').slice(0, 8);
}

function loadMap() {
  if (!existsSync(MAP_PATH)) return {};
  return JSON.parse(readFileSync(MAP_PATH, 'utf-8'));
}

function saveMap(map) {
  writeFileSync(MAP_PATH, `${JSON.stringify(map, null, 2)}\n`);
}

async function promptForJob(rl, jobs, { fullName, initials, jobTitle, company, text, postedDate }) {
  console.error(`\nUnknown recommender: ${fullName} / ${initials} (${jobTitle} at ${company}) — ${postedDate}`);
  console.error(`  "${text.slice(0, 140)}..."`);
  jobs.forEach((job, i) => {
    console.error(`  ${i + 1}) ${job.companyName}  [${job.id}]`);
  });
  console.error(`  ${jobs.length + 1}) Leave empty — fill in manually`);

  return new Promise((resolve) => {
    rl.question(`  Pick a job [1-${jobs.length + 1}]: `, (answer) => {
      const n = parseInt(answer.trim(), 10);
      if (!Number.isFinite(n) || n < 1 || n > jobs.length + 1) {
        resolve('');
      } else if (n === jobs.length + 1) {
        resolve('');
      } else {
        resolve(jobs[n - 1].id);
      }
    });
  });
}

async function main() {
  const [inputPath, outputPath = 'src/data/recommendations.json'] = process.argv.slice(2);
  if (inputPath === undefined) {
    console.error('Usage: yarn import:rec <Recommendations_Received.csv> [outputPath]');
    process.exit(1);
  }

  const csv = readFileSync(inputPath, 'utf-8');
  const [header, ...rows] = parseCsv(csv);
  // Case-insensitive so minor header casing differences don't break the script.
  const columnIndex = (name) => header.findIndex((h) => h.trim().toLowerCase() === name);

  const idx = {
    firstName: columnIndex('first name'),
    lastName: columnIndex('last name'),
    company: columnIndex('company'),
    jobTitle: columnIndex('job title'),
    text: columnIndex('text'),
    creationDate: columnIndex('creation date'),
  };
  // Fail fast naming the missing column rather than a confusing "undefined" downstream.
  for (const [key, value] of Object.entries(idx)) {
    if (value === -1) {
      throw new Error(`Recommendations_Received.csv is missing expected column for "${key}"`);
    }
  }

  // No per-recommendation URL in the export, so every entry links to the same profile section.
  const { linkedIn } = JSON.parse(readFileSync('src/data/contact.json', 'utf-8'));
  const recommendationUrl = `${linkedIn}/details/recommendations/`;

  const jobs = JSON.parse(readFileSync('src/data/jobs.json', 'utf-8'));
  const map = loadMap();

  const rl = createInterface({ input: process.stdin, output: process.stderr });

  const usedIds = new Set();
  const recommendations = [];
  let mapDirty = false;

  for (const row of rows) {
    const firstName = row[idx.firstName];
    const lastName = row[idx.lastName];
    const company = row[idx.company].trim();
    const authorInitials = toInitials(firstName, lastName);
    const text = row[idx.text].trim();

    const key = nameKey(firstName, lastName);
    let jobId = map[key];

    if (jobId === undefined) {
      jobId = await promptForJob(rl, jobs, {
        fullName: `${firstName.trim()} ${lastName.trim()}`,
        initials: authorInitials,
        jobTitle: row[idx.jobTitle].trim(),
        company,
        text,
        postedDate: parseCreationDate(row[idx.creationDate]),
      });
      map[key] = jobId;
      mapDirty = true;
    }

    // Content-derived id (company + initials + hash of text), not position-derived.
    const base = `${slugify(company)}-${authorInitials.toLowerCase()}-${createHash('sha1').update(text).digest('hex').slice(0, 6)}`;
    const id = uniqueId(base, usedIds);

    recommendations.push({
      id,
      jobId,
      authorInitials,
      authorRole: {
        jobTitle: row[idx.jobTitle].trim(),
        company,
      },
      text,
      postedDate: parseCreationDate(row[idx.creationDate]),
      recommendationUrl,
    });
  }

  rl.close();

  if (mapDirty) saveMap(map);

  writeFileSync(outputPath, `${JSON.stringify(recommendations, null, 2)}\n`);
  console.error(
    `Wrote ${recommendations.length} recommendation(s) to ${outputPath}.` +
      (mapDirty ? `\nUpdated ${MAP_PATH} with ${Object.keys(map).length} mapping(s).` : '') +
      `\nNote: only initials are stored — recommenders' full names from the CSV were never ` +
      `written to this file. "recommendationUrl" points at your profile's ` +
      `recommendations section (LinkedIn doesn't expose a per-recommendation URL), so it's ` +
      `the same link on every entry.\n` +
      `Skills highlighted by each recommendation are not in the CSV — add them to src/data/skills.json instead.`,
  );
}

main();
