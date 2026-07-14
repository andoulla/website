#!/usr/bin/env node
/**
 * Drafts skill–responsibility/recommendation mappings via sentence embeddings.
 *
 * Embeds skills (name + synonyms) and career responsibilities/recommendations using a local model,
 * reports (text, skill) pairs above the similarity threshold. Human/Claude then applies accepted
 * suggestions to src/data/ and commits — this script only writes a report, never touches src/data/.
 *
 * Deterministic: pinned model + identical inputs → byte-identical report. Model (~25 MB) downloads
 * once from Hugging Face Hub and caches locally.
 *
 * Usage: yarn draft:mappings [--threshold=0.5]
 * Output: scripts/output/draft-mappings.json (gitignored)
 */

import { mkdirSync, readFileSync, writeFileSync } from 'fs';

import { pipeline } from '@huggingface/transformers';

import { slugify } from './lib/slug.mjs';

const MODEL = 'Xenova/all-MiniLM-L6-v2';
const DTYPE = 'q8'; // Pinned: quantisation affects scores; defaults can change between library versions.
const DEFAULT_THRESHOLD = 0.5;

function parseThreshold(argv) {
  const flag = argv.find((arg) => arg.startsWith('--threshold='));
  if (flag === undefined) return DEFAULT_THRESHOLD;

  const value = Number(flag.split('=')[1]);
  if (Number.isNaN(value) || value <= 0 || value >= 1) {
    console.error(`Invalid --threshold "${flag}" — expected a number between 0 and 1.`);
    process.exit(1);
  }
  return value;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function skillId(skill) {
  return skill.id ?? slugify(skill.name);
}

function jobResponsibilities(job) {
  return job.responsibilities.map((responsibility, index) => {
    if (typeof responsibility === 'string') {
      return { id: `${job.id}-r${String(index + 1).padStart(2, '0')}`, text: responsibility };
    }
    return { id: responsibility.id, text: responsibility.text };
  });
}

function cosine(a, b) {
  // L2-normalised embeddings: dot product IS cosine similarity.
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

function suggestionsFor(textEmbedding, skillEntries, threshold) {
  return skillEntries
    .map(({ id, embedding }) => ({ skillId: id, score: Math.round(cosine(textEmbedding, embedding) * 1000) / 1000 }))
    .filter((suggestion) => suggestion.score >= threshold)
    .sort((a, b) => b.score - a.score || a.skillId.localeCompare(b.skillId));
}

async function main() {
  const threshold = parseThreshold(process.argv.slice(2));

  const skills = readJson('src/data/skills.json');
  const careerHistory = readJson('src/data/careerHistory.json');
  const recommendations = readJson('src/data/recommendations.json');

  const skillTexts = skills.map((skill) => [skill.name, ...(skill.synonyms ?? [])].join(', '));
  const responsibilities = careerHistory.flatMap(jobResponsibilities);
  const recommendationTexts = recommendations.map((recommendation) => recommendation.text);

  console.error(`Loading ${MODEL} (${DTYPE})…`);
  const extract = await pipeline('feature-extraction', MODEL, { dtype: DTYPE });
  const embed = async (texts) => (await extract(texts, { pooling: 'mean', normalise: true })).tolist();

  console.error(
    `Embedding ${skills.length} skills, ${responsibilities.length} responsibilities, ` +
      `${recommendations.length} recommendations…`,
  );
  const skillEmbeddings = await embed(skillTexts);
  const responsibilityEmbeddings = await embed(responsibilities.map((r) => r.text));
  const recommendationEmbeddings = await embed(recommendationTexts);

  const skillEntries = skills.map((skill, index) => ({
    id: skillId(skill),
    embedding: skillEmbeddings[index],
  }));

  const report = {
    model: MODEL,
    dtype: DTYPE,
    threshold,
    responsibilities: responsibilities.map((responsibility, index) => ({
      id: responsibility.id,
      text: responsibility.text,
      suggestions: suggestionsFor(responsibilityEmbeddings[index], skillEntries, threshold),
    })),
    recommendations: recommendations.map((recommendation, index) => ({
      id: recommendation.id,
      suggestions: suggestionsFor(recommendationEmbeddings[index], skillEntries, threshold),
    })),
  };

  mkdirSync('scripts/output', { recursive: true });
  const outputPath = 'scripts/output/draft-mappings.json';
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);

  const suggested = [...report.responsibilities, ...report.recommendations].filter(
    (entry) => entry.suggestions.length > 0,
  ).length;
  console.error(
    `Wrote ${outputPath} (threshold ${threshold}): ` +
      `${suggested}/${report.responsibilities.length + report.recommendations.length} texts got suggestions.\n` +
      `Report only — apply accepted rows to src/data/ by hand (or via the merge pass) and commit.`,
  );
}

await main();
