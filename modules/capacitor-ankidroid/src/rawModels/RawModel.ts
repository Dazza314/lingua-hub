import { z } from "zod";

/**
 * Raw note type (model) as returned by the AnkiDroid ContentProvider bridge.
 * Defines the field structure and card templates for a group of notes.
 */
export const RawModelSchema = z
  .object({
    id: z.string().describe("Anki database ID for this note type"),
    name: z
      .string()
      .describe(
        'User-visible note type name, e.g. "Basic" or "Japanese (Recognition)"',
      ),
    fieldNames: z
      .array(z.string())
      .describe(
        "Ordered field names, e.g. ['Front', 'Back']. Parsed from \\x1f-separated string in Kotlin.",
      ),
    numCards: z
      .number()
      .int()
      .describe("Number of card templates this note type generates per note"),
    sortFieldIndex: z
      .number()
      .int()
      .describe(
        "Index into fieldNames of the field used for sorting in the browser",
      ),
    type: z
      .number()
      .int()
      .describe("0 = normal note type, 1 = cloze deletion note type"),
  })
  .describe("Raw note type (model) from AnkiDroid ContentProvider");

export type RawModel = z.infer<typeof RawModelSchema>;
