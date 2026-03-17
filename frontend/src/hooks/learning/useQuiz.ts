// src/hooks/learning/useQuiz.ts

import { useQuery } from "@tanstack/react-query";
import { quizApi } from "@/api";

export const useQuiz = (id?: number) => {
  return useQuery({
    queryKey: ["quiz", id],
    queryFn: () => {
      if (!id) throw new Error("ID is required");
      return quizApi.getById(id);
    },
    enabled: !!id,
  });
};

export const useQuizList = () => {
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: () => quizApi.getAll(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useQuizByLevel = (level: string) => {
  return useQuery({
    queryKey: ["quizzes", "level", level],
    queryFn: () => quizApi.getByLevel(level),
    staleTime: 1000 * 60 * 5,
  });
};

export const useQuizByDifficulty = (difficulty: string) => {
  return useQuery({
    queryKey: ["quizzes", "difficulty", difficulty],
    queryFn: () => quizApi.getByDifficulty(difficulty),
    staleTime: 1000 * 60 * 5,
  });
};
