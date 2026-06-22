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

export const dictionaryApi = {
  search: (query: string) =>
    apiClient.get<DictionaryEntry[]>(`/api/dictionary/search`, { q: query }),
  getDetail: (id: number) => apiClient.get<DictionaryEntry>(`/api/dictionary/${id}`),
};
