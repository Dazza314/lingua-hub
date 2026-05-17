# Candidate-and-judge pipeline for exercise generation

The exercise generation prompt sometimes produces unnatural-sounding sentences. This is a known limitation of single-pass generation: the model commits to a sentence and then rationalises it rather than genuinely evaluating it.

## Proposed approach

Replace the single generation call with two sequential calls:

1. **Generator call** — same prompt as current, but requests N candidate sentence+tag pairs as structured output via `generateObject` with a Zod schema:

   ```ts
   { candidates: [{ tag: string, sentence: string }, ...] }
   ```

2. **Judge call** — takes the candidates as input. Prompted to evaluate each for grammatical correctness, idiomatic naturalness, register consistency, and tag quality (disambiguates without spoiling). Returns the chosen candidate plus brief reasoning.

## Why it helps

Separating generation from evaluation forces genuine comparison. The model judges sentences it didn't just commit to, which catches the constructed-but-unnatural cases that single-pass generation produces and rationalises.

## Cost

~2x API calls and latency vs. single generation.

## Upgrade path

If candidates from one generation call lack diversity (all share the same flaws), switch to parallel independent generations (`Promise.all` of N single-candidate calls) feeding into the same judge call.

## Logging

Persist all candidates plus the judge's reasoning, not just the final pick. Gives data on failure patterns for future prompt tuning.
