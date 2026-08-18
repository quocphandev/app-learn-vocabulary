// Parses "2.TỪ VỰNG NGỮ PHÁP CĂN BẢN.pdf" into src/data/vocabulary.json.
// Run with: node scripts/generate-vocabulary.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { PDFParse } from 'pdf-parse';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PDF_PATH = path.join(ROOT, '2.TỪ VỰNG NGỮ PHÁP CĂN BẢN.pdf');
const OUT_PATH = path.join(ROOT, 'src', 'data', 'vocabulary.json');

const BASELINE_MAX_ID = 300;
const TOTAL_EXPECTED = 1115;

const POS_MAP = {
  n: 'noun',
  v: 'verb',
  adj: 'adjective',
  adv: 'adverb',
  prep: 'preposition',
  conj: 'conjunction',
  phr: 'phrase',
  pron: 'pronoun',
  deter: 'determiner',
};

function isFooterPageNumberLine(line) {
  return /^\s*\d+\s*$/.test(line);
}

function isPageSeparatorLine(line) {
  return /^--\s*\d+\s*of\s*\d+\s*--$/i.test(line);
}

function isEntryStartLine(line) {
  return /^\s*\d+\.\s*/.test(line);
}

// Group raw lines into one buffer per numbered entry, merging wrapped lines.
function groupIntoEntries(rawText) {
  const lines = rawText.split(/\r?\n/);
  const entries = [];
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === '') continue;
    if (isFooterPageNumberLine(line)) continue;
    if (isPageSeparatorLine(line)) continue;

    if (isEntryStartLine(line)) {
      if (current) entries.push(current);
      const match = line.match(/^\s*(\d+)\.\s*(.*)$/);
      current = { id: Number(match[1]), buffer: match[2] };
    } else if (current) {
      current.buffer += ' ' + line;
    }
    // else: stray line before the first entry (title/header) — ignore.
  }
  if (current) entries.push(current);
  return entries;
}

// Normalize a raw "(...)" pos annotation like "v, n" / "adj, adv" / "v3" / "to" / "" into
// a single mapped pos string (joined with '/' for compound entries), or null if unmappable.
function normalizePos(rawPosText) {
  const tokens = rawPosText
    .split(/[,/]/)
    .map((t) => t.trim().toLowerCase().replace(/\d+$/, '')) // "v3" -> "v"
    .filter(Boolean)
    .map((t) => POS_MAP[t])
    .filter(Boolean);
  if (tokens.length === 0) return null;
  return [...new Set(tokens)].join('/');
}

// If the IPA slash-pair got mangled (source PDF sometimes drops the opening "/"),
// recover a trailing ".../ipa-looking-text/" fragment from the meaning text.
function recoverDroppedLeadingSlash(meaningVi) {
  const m = meaningVi.match(/^(.*?)\s+(\S+)\/$/);
  if (!m) return { meaningVi, ipa: null };
  return { meaningVi: m[1].trim(), ipa: m[2].trim() };
}

// Extract { word, pos, meaningVi, ipa } from one entry's normalized buffer text.
function parseEntryFields(buffer) {
  const text = buffer.replace(/\s+/g, ' ').trim();
  let word, pos, meaningVi, ipa;

  // Form: "Word (pos)[:] meaning [/ipa/]" — colon after the pos group is optional
  // (a few source entries drop it, e.g. "Receive (v) nhận /rɪˈsiːv/").
  let m = text.match(/^(.*?)\s*\(([^)]*)\)\s*:?\s*(.*?)(?:\s*\/(.*?)\/\s*)?$/);
  if (m && m[2].trim() !== '') {
    word = m[1].trim();
    pos = normalizePos(m[2]);
    meaningVi = m[3].trim();
    ipa = m[4] ? m[4].trim() : null;
  } else {
    // No usable (pos) group: "Word : meaning /ipa/" or "Word : meaning"
    m = text.match(/^(.*?)\s*:\s*(.*?)(?:\s*\/(.*?)\/\s*)?$/);
    if (m) {
      word = m[1].trim();
      pos = null;
      meaningVi = m[2].trim();
      ipa = m[3] ? m[3].trim() : null;
    } else {
      word = text;
      pos = null;
      meaningVi = '';
      ipa = null;
    }
  }

  if (!ipa && meaningVi) {
    const recovered = recoverDroppedLeadingSlash(meaningVi);
    meaningVi = recovered.meaningVi;
    ipa = recovered.ipa;
  }

  word = word.replace(/\s*\(\s*\)\s*$/, '').trim(); // drop empty "()" pos annotation leftovers
  if (ipa) ipa = ipa.replace(/\//g, ' ').replace(/\s+/g, ' ').trim(); // collapse stray internal slashes

  return { word, pos, meaningVi, ipa };
}

async function main() {
  const buffer = readFileSync(PDF_PATH);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();

  const rawEntries = groupIntoEntries(result.text);

  const seenIds = new Set();
  const vocabulary = [];
  const missingPos = [];
  const missingIpa = [];

  for (const { id, buffer: entryBuffer } of rawEntries) {
    if (seenIds.has(id)) {
      console.warn(`Duplicate id ${id}, skipping duplicate.`);
      continue;
    }
    seenIds.add(id);

    const { word, pos, meaningVi, ipa } = parseEntryFields(entryBuffer);
    if (!pos) missingPos.push(id);
    if (!ipa) missingIpa.push(id);

    vocabulary.push({
      id,
      word,
      pos,
      meaningVi,
      ipa,
      tags: id <= BASELINE_MAX_ID ? ['baseline'] : [],
    });
  }

  vocabulary.sort((a, b) => a.id - b.id);

  // Validation
  const ids = vocabulary.map((e) => e.id);
  const minId = Math.min(...ids);
  const maxId = Math.max(...ids);
  console.log(`Parsed ${vocabulary.length} entries, id range ${minId}-${maxId}.`);
  if (vocabulary.length !== TOTAL_EXPECTED) {
    console.warn(`WARNING: expected ${TOTAL_EXPECTED} entries, got ${vocabulary.length}.`);
  }
  const expectedIds = new Set(Array.from({ length: TOTAL_EXPECTED }, (_, i) => i + 1));
  for (const id of ids) expectedIds.delete(id);
  if (expectedIds.size > 0) {
    console.warn('WARNING: missing ids:', [...expectedIds].sort((a, b) => a - b));
  }
  console.log(`Entries missing pos (${missingPos.length}):`, missingPos);
  console.log(`Entries missing ipa (${missingIpa.length}):`, missingIpa);

  writeFileSync(OUT_PATH, JSON.stringify(vocabulary, null, 2) + '\n', 'utf-8');
  console.log(`Wrote ${vocabulary.length} entries to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
