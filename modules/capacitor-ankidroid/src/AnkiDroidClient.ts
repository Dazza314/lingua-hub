import { registerPlugin } from "@capacitor/core";
import { z } from "zod";
import type { RawAddNoteOptions } from "./rawModels/RawAddNoteOptions.js";
import { RawDeckSchema } from "./rawModels/RawDeck.js";
import type { RawDeck } from "./rawModels/RawDeck.js";
import { RawModelSchema } from "./rawModels/RawModel.js";
import type { RawModel } from "./rawModels/RawModel.js";
import type { RawNoteQuery } from "./rawModels/RawNoteQuery.js";
import { RawNoteWithCardsSchema } from "./rawModels/RawNoteWithCards.js";
import type { RawNoteWithCards } from "./rawModels/RawNoteWithCards.js";
import { RawNotesPageSchema, type RawNotesPage } from "./rawModels/RawPaginatedResult.js";
import { RawPermissionStatusSchema, type RawPermissionStatus } from "./rawModels/RawPermissionStatus.js";

/**
 * Minimal type for the untyped Capacitor bridge proxy.
 * Only declares method names — all return Promise<unknown>.
 * Real type safety comes from Zod parsing in the client below.
 */
interface AnkiDroidBridge {
  checkPermission(): Promise<unknown>;
  requestPermission(): Promise<unknown>;
  getDecks(): Promise<unknown>;
  getModels(): Promise<unknown>;
  getNotesWithCards(options?: unknown): Promise<unknown>;
  getNoteWithCards(options: unknown): Promise<unknown>;
  countNotes(options?: unknown): Promise<unknown>;
  addNote(options: unknown): Promise<unknown>;
}

const bridge = registerPlugin<AnkiDroidBridge>("AnkiDroid");

/**
 * Typed client for the AnkiDroid Capacitor plugin.
 *
 * Wraps the untyped Capacitor bridge with Zod validation — every response
 * is parsed against its raw schema before being returned. This is the only
 * place where bridge data crosses into typed TypeScript.
 */
export const AnkiDroidClient = {
  async checkPermission(): Promise<RawPermissionStatus> {
    const raw = await bridge.checkPermission();
    return RawPermissionStatusSchema.parse(raw);
  },

  async requestPermission(): Promise<RawPermissionStatus> {
    const raw = await bridge.requestPermission();
    return RawPermissionStatusSchema.parse(raw);
  },

  async getDecks(): Promise<{ decks: RawDeck[] }> {
    const raw = await bridge.getDecks();
    return z.object({ decks: z.array(RawDeckSchema) }).parse(raw);
  },

  async getModels(): Promise<{ models: RawModel[] }> {
    const raw = await bridge.getModels();
    return z.object({ models: z.array(RawModelSchema) }).parse(raw);
  },

  async getNotesWithCards(options?: RawNoteQuery): Promise<RawNotesPage> {
    const raw = await bridge.getNotesWithCards(options);
    return RawNotesPageSchema.parse(raw);
  },

  async getNoteWithCards(options: { noteId: string }): Promise<{ note: RawNoteWithCards }> {
    const raw = await bridge.getNoteWithCards(options);
    return z.object({ note: RawNoteWithCardsSchema }).parse(raw);
  },

  async countNotes(options?: { deckId?: string; modelId?: string; modifiedSince?: number }): Promise<{ count: number }> {
    const raw = await bridge.countNotes(options);
    return z.object({ count: z.number().int() }).parse(raw);
  },

  async addNote(options: RawAddNoteOptions): Promise<{ noteId: string }> {
    const raw = await bridge.addNote(options);
    return z.object({ noteId: z.string() }).parse(raw);
  },
};
