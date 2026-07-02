import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

// Sourced from the OpenAPI schema (run `npm run gen:api` after BE DTO changes).
// springdoc marks every field optional; the dictionary view-model treats them as present.
export type DictionaryEntry = Required<Schema<"VocabularyDto">>;

export type ExampleSentence = Required<Pick<Schema<"ExampleSentenceDto">, "tatoebaId" | "jp">> &
  Pick<Schema<"ExampleSentenceDto">, "vi" | "en">;

export type FuriganaToken = Schema<"FuriganaToken">;

export const dictionaryApi = {
  search: (query: string) =>
    apiClient.get<DictionaryEntry[]>(`/api/dictionary/search`, { q: query }),
  getDetail: (id: number) => apiClient.get<DictionaryEntry>(`/api/dictionary/${id}`),
  getExamples: (query: string) =>
    apiClient.get<ExampleSentence[]>(`/api/dictionary/examples`, { q: query }),
  /** Related / compound words that contain the headword (e.g. 手を結ぶ for 結ぶ). */
  getRelated: (query: string) =>
    apiClient.get<DictionaryEntry[]>(`/api/dictionary/related`, { q: query }),
  /** Annotate a batch of Japanese texts with furigana (ruby over kanji). */
  furigana: (texts: string[]) =>
    apiClient.post<FuriganaToken[][]>(`/api/dictionary/furigana`, { texts }),
  /** All radicals available for the radical picker. */
  getRadicals: () => apiClient.get<string[]>(`/api/dictionary/radicals`),
  /** Kanji containing ALL of the given radicals. */
  getKanjiByRadicals: (radicals: string[]) =>
    apiClient.get<string[]>(`/api/dictionary/kanji-by-radicals`, { radicals: radicals.join(",") }),
  /** Promote a JMdict word into vocabulary (so it can be saved). Returns the curated entry. */
  materialize: (dictWordId: number) =>
    apiClient.post<DictionaryEntry>(`/api/dictionary/words/${dictWordId}/materialize`),
  /** Translate a JMdict word's English meaning to Vietnamese (cached server-side). */
  translateMeaning: (dictWordId: number) =>
    apiClient.post<{ vi: string }>(`/api/dictionary/words/${dictWordId}/translate`),
};
