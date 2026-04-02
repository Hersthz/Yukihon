import { useQuery } from "@tanstack/react-query";
import { myWordsApi, vocabularyApi } from "@/api";
import type { SavedWord } from "@/pages/my-words/types";

export const useVocabulary = (id?: number) => {
  return useQuery({
    queryKey: ["vocabulary", id],
    queryFn: () => {
      if (!id) throw new Error("ID is required");
      return vocabularyApi.getById(id);
    },
    enabled: !!id,
  });
};

export const useVocabularyList = () => {
  return useQuery({
    queryKey: ["vocabulary"],
    queryFn: () => vocabularyApi.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useVocabularyByLevel = (level: string) => {
  return useQuery({
    queryKey: ["vocabulary", "level", level],
    queryFn: () => vocabularyApi.getByLevel(level),
    staleTime: 1000 * 60 * 5,
  });
};

export const useVocabularyLevels = () => {
  return useQuery({
    queryKey: ["vocabulary", "levels"],
    queryFn: () => vocabularyApi.getLevels(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useSavedWords = () => {
  return useQuery({
    queryKey: ["my-words", "all"],
    queryFn: () => myWordsApi.getAll() as Promise<SavedWord[]>,
    staleTime: 1000 * 60,
  });
};
