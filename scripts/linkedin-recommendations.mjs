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
// Usage:
//   yarn import:rec <path-to-Recommendations_Received.csv> [outputPath]
//
// Defaults outputPath to src/data/recommendations.linkedin.json (review/diff
// before replacing src/data/recommendations.json yourself).

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';

import { parseCsv } from './lib/csv.mjs';
import { slugify, uniqueId } from './lib/slug.mjs';

// "M/D/YYYY" (e.g. "1/15/2022") -> "YYYY-MM-DD".
function parseCreationDate(value) {
  const trimmed = value.trim();
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (match === null) {
    throw new Error(`Unrecognized LinkedIn date format: "${value}"`);
  }
  const [, month, day, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// First+Last name -> two uppercase initials. The full name itself is never captured.
function toInitials(firstName, lastName) {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();
}

function main() {
  const [inputPath, outputPath = 'src/data/recommendations.linkedin.json'] = process.argv.slice(2);
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

  // Match by company name against the committed jobs.json to find each recommendation's jobId.
  const jobs = JSON.parse(readFileSync('src/data/jobs.json', 'utf-8'));
  const findJobId = (company) => {
    const normalized = company.trim().toLowerCase();
    const job = jobs.find((j) => j.companyName.trim().toLowerCase() === normalized);
    return job?.id ?? '';
  };

  const usedIds = new Set();
  const unmatched = [];

  const recommendations = rows.map((row) => {
    const company = row[idx.company].trim();
    const authorInitials = toInitials(row[idx.firstName], row[idx.lastName]);
    const text = row[idx.text].trim();
    const jobId = findJobId(company);
    if (jobId === '') unmatched.push(company);

    // Content-derived id (company + initials + hash of text), not position-derived.
    const base = `${slugify(company)}-${authorInitials.toLowerCase()}-${createHash('sha1').update(text).digest('hex').slice(0, 6)}`;

    return {
      id: uniqueId(base, usedIds),
      jobId,
      authorInitials,
      authorRole: {
        jobTitle: row[idx.jobTitle].trim(),
        company,
      },
      text,
      postedDate: parseCreationDate(row[idx.creationDate]),
      recommendationUrl,
    };
  });

  writeFileSync(outputPath, `${JSON.stringify(recommendations, null, 2)}\n`);
  console.error(
    `Wrote ${recommendations.length} recommendation(s) to ${outputPath}.\n` +
      `Note: only initials are stored — recommenders' full names from the CSV were never ` +
      `written to this file. "recommendationUrl" points at your profile's ` +
      `recommendations section (LinkedIn doesn't expose a per-recommendation URL), so it's ` +
      `the same link on every entry.` +
      (unmatched.length > 0
        ? `\nWARNING: couldn't match these companies to a job in src/data/jobs.json — ` +
          `"jobId" left empty, fill in manually: ${unmatched.join(', ')}`
        : ''),
  );
}

main();
