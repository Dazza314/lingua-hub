import { z } from "zod";

/**
 * Raw deck as returned by the AnkiDroid ContentProvider bridge.
 * Decks can be nested using '::' as a separator (e.g., "Japanese::Core 2000").
 */
export const RawDeckSchema = z
  .object({
    id: z.string().describe("Anki database ID for this deck"),
    name: z
      .string()
      .describe(
        'Full deck name including parent path, e.g. "Japanese::Core 2000". Use "::" to split into segments.',
      ),
    description: z
      .string()
      .describe("User-written deck description shown on the overview screen"),
    counts: z
      .object({
        learn: z
          .number()
          .int()
          .describe(
            "Cards currently in the learning phase (new cards being drilled)",
          ),
        review: z
          .number()
          .int()
          .describe("Cards due for spaced-repetition review today"),
        new: z.number().int().describe("Cards not yet seen for the first time"),
      })
      .describe("Today's due counts"),
    isDynamic: z
      .boolean()
      .describe(
        "True if this is a filtered/dynamic deck (auto-generated from a search query)",
      ),
  })
  .describe("Raw deck from AnkiDroid ContentProvider");
export type RawDeck = z.infer<typeof RawDeckSchema>;
