#!/usr/bin/env node
// One-off conversion utility — not part of the app build/lint/type-check surface.
//
// Converts the "Positions.csv" file from a LinkedIn data export
// (Settings -> Data privacy -> Get a copy of your data) into the
// src/data/jobs.json shape used by loadExperiences.
//
// Usage:
//   yarn import:jobs <path-to-Positions.csv> [outputPath]
//
// Defaults outputPath to src/data/jobs.linkedin.json (review/diff before
// replacing src/data/jobs.json yourself).

import { readFileSync, writeFileSync } from 'fs';

import { parseCsv } from './lib/csv.mjs';
import { slugify, uniqueId } from './lib/slug.mjs';

const MONTHS = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
};

// "Mon YYYY" (e.g. "Jan 2022") -> "YYYY-MM-01". Empty means ongoing, so maps to null.
function parseMonthYearDate(value) {
  const trimmed = value.trim();
  if (trimmed === '') return null;

  const [monthAbbr, year] = trimmed.split(/\s+/);
  const month = MONTHS[monthAbbr.toLowerCase().slice(0, 3)];
  if (month === undefined || year === undefined) {
    throw new Error(`Unrecognized LinkedIn date format: "${value}"`);
  }
  return `${year}-${month}-01`;
}

// Splits a description into one responsibility per line, stripping leading bullets.
function toResponsibilities(description) {
  return description
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•\-*]\s*/, '').trim())
    .filter((line) => line !== '');
}

function main() {
  const [inputPath, outputPath = 'src/data/jobs.linkedin.json'] = process.argv.slice(2);
  if (inputPath === undefined) {
    console.error('Usage: yarn import:jobs <Positions.csv> [outputPath]');
    process.exit(1);
  }

  const csv = readFileSync(inputPath, 'utf-8');
  const [header, ...rows] = parseCsv(csv);
  // Case-insensitive so minor header casing differences don't break the script.
  const columnIndex = (name) => header.findIndex((h) => h.trim().toLowerCase() === name);

  const idx = {
    companyName: columnIndex('company name'),
    title: columnIndex('title'),
    description: columnIndex('description'),
    location: columnIndex('location'),
    startedOn: columnIndex('started on'),
    finishedOn: columnIndex('finished on'),
  };
  // Fail fast naming the missing column rather than a confusing "undefined" downstream.
  for (const [key, value] of Object.entries(idx)) {
    if (value === -1) throw new Error(`Positions.csv is missing expected column for "${key}"`);
  }

  // No per-position URL in the export, so every job links to the same profile section.
  const { linkedIn } = JSON.parse(readFileSync('src/data/contact.json', 'utf-8'));
  const experienceUrl = `${linkedIn}/details/experience/`;

  const jobs = rows.map((row) => ({
    companyName: row[idx.companyName].trim(),
    title: row[idx.title].trim(),
    location: row[idx.location].trim(),
    startDate: parseMonthYearDate(row[idx.startedOn]),
    endDate: parseMonthYearDate(row[idx.finishedOn]),
    responsibilities: toResponsibilities(row[idx.description] ?? ''),
    skills: [],
    logo: '',
    experienceUrl,
  }));

  // Most recent / ongoing role first.
  jobs.sort((a, b) => {
    if (a.startDate === null) return -1;
    if (b.startDate === null) return 1;
    return b.startDate.localeCompare(a.startDate);
  });

  const usedIds = new Set();
  const withIds = jobs.map((job) => {
    // "title" isn't part of WorkExperience; re-added at the end for the reviewer only.
    const { title, ...rest } = job;
    const base = `${slugify(job.companyName)}-${job.startDate?.slice(0, 7) ?? 'undated'}`;
    return { id: uniqueId(base, usedIds), ...rest, title };
  });

  writeFileSync(outputPath, `${JSON.stringify(withIds, null, 2)}\n`);
  console.error(
    `Wrote ${withIds.length} position(s) to ${outputPath}.\n` +
      `Note: "skills" is left empty (LinkedIn export doesn't map skills to positions) and ` +
      `"logo" is left empty — drop a logo file in and fill the path in yourself. ` +
      `"experienceUrl" points at your profile's experience section (LinkedIn doesn't ` +
      `expose a per-position URL), so it's the same link on every entry. ` +
      `"title" isn't part of the current WorkExperience type — decide where it should live ` +
      `before merging into src/data/jobs.json.`,
  );
}

main();
