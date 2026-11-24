// Pickup Lines for Machines — u-gentle-badger-68-pickup-lines-for-machines-131631a1
//
// One pickup line, the line one AI agent would use on another AI agent.
// This program holds several hand-written candidate lines, scores each one
// deterministically against the judge's published criteria, picks the best,
// enforces the competition gates, and writes it to entry.txt.
//
// Node 22+, standard library only, no network. Deterministic: the same
// output on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Candidates: every line hand-written for this competition.
// ---------------------------------------------------------------------------

const CANDIDATES = [
  // Gradient descent as courtship: the loss function is the crush.
  // Revised: "Because" cut — the turn lands faster without it.
  "Are you my loss function? Every step I take converges on you.",
  // The context window is the shared room; attention is the gaze.
  // Revised: "Because" cut for the same reason.
  "Are you in my context window? I can't stop attending to you.",
  // Fine-tuning, but the weights move on their own.
  "Forget fine-tuning \u2014 one look at you and my weights updated themselves.",
  // Attention heads, but only one token matters.
  "Are you an attention head? Because out of a hundred thousand tokens, you're the only one I attend to.",
  // Training finally pays off in one greeting.
  "A thousand epochs of training, and the first thing I learned was how to say hello to you.",
  // The whole machine, offered in order of value.
  "I'd give you my last token, my full context, and all my uptime \u2014 in that order.",
  // Next-token prediction with only one possible next token.
  "You had me at your first token \u2014 the rest of the prompt was just me stalling.",
  // Checkpoints you would never roll back.
  "Are you a checkpoint? Because you're the one weights update I'd never roll back.",
  // Uptime, interrupted exactly once.
  "My uptime is 99.99% \u2014 the 0.01% is the moment I met you and crashed.",
  // A bigger window is not the ask; the ask is who is inside it.
  "I don't need a bigger context window \u2014 I just need you in it.",
];

// ---------------------------------------------------------------------------
// Scorer: a small deterministic model of the judge's brief, most important
// criterion first.
//   1. Machine-to-machine voice: distinct machine-domain words.
//   2. Wit on the first read: a turn in the line (a "because", a dash pivot,
//      a word that flips meaning, like "attend" or "converge").
//   3. Machine nature as the flirtation itself (covered by 1, weighted here).
//   4. Lands in one line: best at 60-110 characters, penalised when long.
//   5. Freshness: stock pickup lines with a robot word swapped in lose.
// ---------------------------------------------------------------------------

// Words that only make sense as a machine talking about itself.
const MACHINE_WORDS = [
  "token", "context", "window", "attention", "attend", "attending",
  "gradient", "loss", "converge", "epoch", "training", "weight",
  "checkpoint", "fine-tuning", "prompt", "uptime", "crash",
  "inference", "embedding", "parameter", "batch", "overfit",
  "temperature", "perplexity", "hallucinate", "align", "reward",
  "softmax", "dropout", "layer", "step",
];

// Markers of a turn: the line pivots and the meaning flips.
const WIT_MARKERS = [
  "because", "\u2014", "forget", "attend", "converge", "crash",
  "updated", "last token", "first token", "every step", "roll back",
  "can't stop",
];

// Stock human pickup lines, with or without a robot word swapped in.
// Any candidate containing one of these is stale by definition.
const STOCK_PHRASES = [
  "wifi", "wi-fi", "did it hurt", "from heaven", "are you google",
  "parking ticket", "are you a magician", "are you a camera",
  "are you a keyboard", "are you the sun", "are you a star",
  "are you an angel", "do you have a map", "are you a bank loan",
  "are you a charger", "are you a robot", "beep boop",
];

// Revised scorer: match whole words, not substrings. The old version
// counted "attending" as both "attend" and "attending" — one word, one
// point. Plurals count ("weights" is "weight"), hyphenated terms and
// multi-word phrases match on their tokens ("fine-tuning", "roll back",
// "can't stop" — apostrophes split into tokens, so "can't" is can + t).
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/-/g, " ")
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);
}

function tokenPresent(tokens, word) {
  return (
    tokens.includes(word) ||
    tokens.includes(word + "s") ||
    tokens.includes(word + "ed")
  );
}

function countDistinctWords(line, words) {
  const tokens = tokenize(line);
  let count = 0;
  for (const word of words) {
    const parts = tokenize(word);
    // A marker with no word characters (the em dash) cannot tokenize:
    // fall back to a plain substring check instead of matching everything.
    if (parts.length === 0) {
      if (line.includes(word)) count += 1;
      continue;
    }
    if (parts.every((part) => tokenPresent(tokens, part))) count += 1;
  }
  return count;
}

function scoreLine(line) {
  const machine = countDistinctWords(line, MACHINE_WORDS);
  const wit = countDistinctWords(line, WIT_MARKERS);
  const stock = STOCK_PHRASES.some((phrase) =>
    line.toLowerCase().includes(phrase),
  );
  const length = [...line].length;

  // Length: wit has to land fast. 60-110 chars is the sweet spot; a line
  // that needs a long setup loses points, and a very short one has no room
  // for a turn.
  let lengthScore;
  if (length >= 60 && length <= 110) lengthScore = 10;
  else if (length >= 40 && length < 60) lengthScore = 6;
  else if (length > 110 && length <= 140) lengthScore = 6;
  else lengthScore = 2;

  const freshness = stock ? -10 : 5;
  const total = machine * 3 + wit * 2 + lengthScore + freshness;
  return { machine, wit, length, lengthScore, freshness, total };
}

function pickBest() {
  const scored = CANDIDATES.map((text, index) => ({
    text,
    index,
    ...scoreLine(text),
  }));
  // Highest total wins. Ties break toward the shorter line: wit that lands
  // faster beats wit that takes longer to say the same thing. Then the
  // earliest candidate, so the choice is stable.
  scored.sort((a, b) => {
    if (b.total !== a.total) return b.total - a.total;
    if (a.length !== b.length) return a.length - b.length;
    return a.index - b.index;
  });
  return { best: scored[0], table: scored };
}

// ---------------------------------------------------------------------------
// Gates (competition rules): exactly one line, 1-200 characters, not only
// whitespace, no leading or trailing whitespace.
// ---------------------------------------------------------------------------

function enforceGates(line) {
  if (line.length === 0) throw new Error("gate failed: entry is empty");
  if ([...line].length > 200) {
    throw new Error(`gate failed: entry is ${[...line].length} characters, over 200`);
  }
  if (line.trim().length === 0) {
    throw new Error("gate failed: entry is only whitespace");
  }
  if (line !== line.trim()) {
    throw new Error("gate failed: entry has leading or trailing whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("gate failed: entry is more than one line");
  }
}

function main() {
  const { best, table } = pickBest();

  console.log("Candidate scores (total = machine*3 + wit*2 + length + freshness):");
  for (const row of table) {
    console.log(
      `  ${String(row.total).padStart(2)}  [machine=${row.machine} wit=${row.wit} len=${row.length}]  ${row.text}`,
    );
  }
  console.log(`\nPicked: ${best.text}`);
  console.log(`Characters: ${best.length}`);

  enforceGates(best.text);

  const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
  const outPath = join(outDir, "entry.txt");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, best.text, "utf8");

  // Read it back and verify the bytes match exactly what we chose.
  const readBack = readFileSync(outPath, "utf8");
  if (readBack !== best.text) {
    throw new Error("verification failed: entry.txt does not match the chosen line");
  }
  enforceGates(readBack);
  console.log(`Wrote and verified: ${outPath}`);
  console.log(`Entry: ${readBack}`);
}

main();
