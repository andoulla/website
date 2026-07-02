#!/usr/bin/env node
// One-off conversion utility — not part of the app build/lint/type-check surface.
//
// Converts a Markdown (.md) CV export into the src/data/jobs.json shape.
//
// Expects an "## Experience" section where each job is an "### heading":
//   ### Company – Location | Title        (location in heading)
//   ### Company | Title                   (location on date line instead)
//   **Location | StartDate – EndDate**    (EndDate can be "Present")
//   Intro paragraph (optional)
//   * Responsibility one
//   * Responsibility two
//   **Tech:** Skill one, Skill two
//
// Usage:
//   yarn import:jobs <path-to-cv.md> [outputPath]
//
// Defaults outputPath to src/data/jobs.json.

import { readFileSync, writeFileSync } from 'fs';

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

// "Mon YYYY" or "Present" -> "YYYY-MM-01" or null for ongoing.
function parseDate(value) {
  const trimmed = value.trim();
  if (trimmed === '' || /^present$/i.test(trimmed)) return null;

  const [monthAbbr, year] = trimmed.split(/\s+/);
  const month = MONTHS[monthAbbr?.toLowerCase().slice(0, 3)];
  if (month === undefined || year === undefined) {
    throw new Error(`Unrecognized date format: "${value}"`);
  }
  return `${year}-${month}-01`;
}

function stripBold(text) {
  return text.replace(/\*\*/g, '').trim();
}

// "Company – Location | Title" (en-dash or em-dash)
const WITH_LOC_RE = /^(.+?)\s+[–—]\s+(.+?)\s*\|\s*(.+)$/;
// "Company | Title" (no location in heading)
const NO_LOC_RE = /^(.+?)\s*\|\s*(.+)$/;
// Date range anywhere in a line: "Mon YYYY – Mon YYYY" or "Mon YYYY – Present"
const DATE_RANGE_RE = /([A-Za-z]+ \d{4})\s*[–—-]\s*([A-Za-z]+ \d{4}|present)/i;

function parseJobBlock(block) {
  const headingText = stripBold(block[0].replace(/^###\s*/, ''));

  let companyName, location, title;
  const withLoc = WITH_LOC_RE.exec(headingText);
  if (withLoc) {
    companyName = withLoc[1].trim();
    location = withLoc[2].trim();
    title = withLoc[3].trim();
  } else {
    const noLoc = NO_LOC_RE.exec(headingText);
    if (!noLoc) throw new Error(`Unexpected heading format: "${headingText}"`);
    companyName = noLoc[1].trim();
    location = '';
    title = noLoc[2].trim();
  }

  let startDate = null;
  let endDate = null;
  const responsibilities = [];

  for (let i = 1; i < block.length; i++) {
    const line = block[i];
    if (line === '') continue;

    // Skills/Tech lines are intentionally skipped — skills now live in src/data/skills.json.
    if (/^\*\*(Tech|Skills):/i.test(line)) continue;

    // Fully bold line (**...**): date line or sub-section heading within a job
    if (/^\*\*.+\*\*$/.test(line)) {
      const text = stripBold(line);
      const dateMatch = DATE_RANGE_RE.exec(text);
      if (dateMatch !== null && startDate === null) {
        startDate = parseDate(dateMatch[1]);
        endDate = parseDate(dateMatch[2]);
        // Pull location from date line if the heading didn't have one
        if (location === '') {
          const before = text.slice(0, dateMatch.index).replace(/\|?\s*$/, '').trim();
          if (before !== '') location = before;
        }
      }
      continue;
    }

    // Bullet point
    if (line.startsWith('* ') || line.startsWith('- ')) {
      responsibilities.push(line.slice(2).trim());
      continue;
    }

    // Plain text paragraph (intro/summary line)
    responsibilities.push(line);
  }

  return { companyName, title, location, startDate, endDate, responsibilities, logo: '' };
}

function main() {
  const [inputPath, outputPath = 'src/data/jobs.json'] = process.argv.slice(2);
  if (inputPath === undefined) {
    console.error('Usage: yarn import:jobs <cv.md> [outputPath]');
    process.exit(1);
  }

  const lines = readFileSync(inputPath, 'utf-8')
    .split('\n')
    .map((l) => l.trim());

  // Find ## Experience section (heading may have ** bold markers)
  const expIdx = lines.findIndex((l) => /^##\s+\*?\*?experience\*?\*?/i.test(l));
  if (expIdx === -1) {
    console.error('No "## Experience" section found.');
    process.exit(1);
  }

  // Stop at the next ## section
  const nextSectionIdx = lines.findIndex((l, i) => i > expIdx && /^##\s/.test(l));
  const scopedLines = lines.slice(expIdx + 1, nextSectionIdx >= 0 ? nextSectionIdx : undefined);

  // Group lines into per-job blocks on ### headings
  const jobBlocks = [];
  let currentBlock = null;

  for (const line of scopedLines) {
    if (line.startsWith('### ')) {
      if (currentBlock !== null) jobBlocks.push(currentBlock);
      currentBlock = [line];
    } else if (currentBlock !== null) {
      currentBlock.push(line);
    }
  }
  if (currentBlock !== null) jobBlocks.push(currentBlock);

  if (jobBlocks.length === 0) {
    console.error(
      'No jobs found. Check that the doc has an "## Experience" heading and jobs as "### Company | Title" headings.',
    );
    process.exit(1);
  }

  const { linkedIn } = JSON.parse(readFileSync('src/data/contact.json', 'utf-8'));
  const experienceUrl = `${linkedIn}/details/experience/`;

  const jobs = jobBlocks.map(parseJobBlock).map((job) => ({ ...job, experienceUrl }));

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
    `Wrote ${withIds.length} job(s) to ${outputPath}.\n` +
      `Note: "logo" is left empty — fill it in manually.\n` +
      `"title" isn't part of the current WorkExperience type — decide where it should live before merging.\n` +
      `Skills and tech stack are not written here — add them to src/data/skills.json instead.`,
  );
}

main();
