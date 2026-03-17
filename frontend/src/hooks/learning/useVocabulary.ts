// src/hooks/learning/useVocabulary.ts

import { useQuery } from "@tanstack/react-query";
import { vocabularyAPI } from "@/api/learningApi";

export const useVocabulary = (id?: number) => {
  return useQuery({
    queryKey: ["vocabulary", id],
    queryFn: () => {
      if (!id) throw new Error("ID is required");
      return vocabularyAPI.getById(id);
    },
    enabled: !!id,
  });
};

export const useVocabularyList = () => {
  return useQuery({
    queryKey: ["vocabulary"],
    queryFn: () => vocabularyAPI.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useVocabularyByLevel = (level: string) => {
  return useQuery({
    queryKey: ["vocabulary", "level", level],
    queryFn: () => vocabularyAPI.getByLevel(level),
    staleTime: 1000 * 60 * 5,
  });
};

export const useVocabularyLevels = () => {
  return useQuery({
    queryKey: ["vocabulary", "levels"],
    queryFn: () => vocabularyAPI.getAllLevels(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
