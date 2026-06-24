import apiClient from "@/lib/apiClient";

export interface DictionaryEntry {
  id: number;
  kanji: string;
  hiragana: string;
  romaji: string;
  meaning: string;
  exampleSentenceJP: string;
  exampleSentenceEN: string;
  wordType: string;
  jlptLevel: string;
  additionalNotes: string;
}

export interface ExampleSentence {
  tatoebaId: number;
  jp: string;
  vi: string | null;
  en: string | null;
}

export const dictionaryApi = {
  search: (query: string) =>
    apiClient.get<DictionaryEntry[]>(`/api/dictionary/search`, { q: query }),
  getDetail: (id: number) => apiClient.get<DictionaryEntry>(`/api/dictionary/${id}`),
  getExamples: (query: string) =>
    apiClient.get<ExampleSentence[]>(`/api/dictionary/examples`, { q: query }),
  /** Promote a JMdict word into vocabulary (so it can be saved). Returns the curated entry. */
  materialize: (dictWordId: number) =>
    apiClient.post<DictionaryEntry>(`/api/dictionary/words/${dictWordId}/materialize`),
  /** Translate a JMdict word's English meaning to Vietnamese (cached server-side). */
  translateMeaning: (dictWordId: number) =>
    apiClient.post<{ vi: string }>(`/api/dictionary/words/${dictWordId}/translate`),
};
