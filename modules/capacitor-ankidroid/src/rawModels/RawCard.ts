import { z } from "zod";

/**
 * Raw card as returned by the AnkiDroid ContentProvider bridge.
 * A card is a generated flashcard derived from a note and a card template.
 *
 */
export const RawCardSchema = z
  .object({
    id: z.string().describe("Anki database ID for this card"),
    noteId: z
      .string()
      .describe("ID of the parent note that generated this card"),
    ordinal: z
      .number()
      .int()
      .describe("Which card template generated this card (0-indexed)"),
    cardName: z
      .string()
      .describe('Name of the card template, e.g. "Card 1" or "Recognition"'),
    deckId: z
      .string()
      .describe("ID of the deck this card currently belongs to"),
    questionSimple: z
      .string()
      .describe("Plain-text question with card styling stripped (no HTML/CSS)"),
    answerSimple: z
      .string()
      .describe("Plain-text answer with card styling stripped (no HTML/CSS)"),
  })
  .describe("Raw card from AnkiDroid ContentProvider");
export type RawCard = z.infer<typeof RawCardSchema>;
