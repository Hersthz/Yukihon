// src/hooks/learning/useQuiz.ts

import { useQuery } from "@tanstack/react-query";
import { quizAPI } from "@/api/learningApi";

export const useQuiz = (id?: number) => {
  return useQuery({
    queryKey: ["quiz", id],
    queryFn: () => {
      if (!id) throw new Error("ID is required");
      return quizAPI.getById(id);
    },
    enabled: !!id,
  });
};

export const useQuizList = () => {
  return useQuery({
    queryKey: ["quizzes"],
    queryFn: () => quizAPI.getAll(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useQuizByLevel = (level: string) => {
  return useQuery({
    queryKey: ["quizzes", "level", level],
    queryFn: () => quizAPI.getByLevel(level),
    staleTime: 1000 * 60 * 5,
  });
};

export const useQuizByDifficulty = (difficulty: string) => {
  return useQuery({
    queryKey: ["quizzes", "difficulty", difficulty],
    queryFn: () => quizAPI.getByDifficulty(difficulty),
    staleTime: 1000 * 60 * 5,
  });
};
