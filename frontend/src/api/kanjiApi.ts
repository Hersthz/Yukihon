import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

// From the OpenAPI schema (run `npm run gen:api` after BE changes). springdoc marks fields
// optional; the view treats a returned kanji as fully present.
export type KanjiInfo = Required<Schema<"KanjiInfoDto">>;

export const kanjiApi = {
  /** Kanji metadata (cache-on-demand from kanjiapi.dev). 404 if the character is unknown. */
  get: (character: string) =>
    apiClient.get<KanjiInfo>(`/api/kanji/${encodeURIComponent(character)}`),
};
