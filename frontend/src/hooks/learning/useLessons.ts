// src/hooks/learning/useLessons.ts

import { useQuery } from "@tanstack/react-query";
import { lessonAPI } from "@/api/learningApi";

export const useLesson = (id?: number) => {
  return useQuery({
    queryKey: ["lesson", id],
    queryFn: () => {
      if (!id) throw new Error("ID is required");
      return lessonAPI.getById(id);
    },
    enabled: !!id,
  });
};

export const useLessonsList = () => {
  return useQuery({
    queryKey: ["lessons"],
    queryFn: () => lessonAPI.getAll(),
    staleTime: 1000 * 60 * 5,
  });
};

export const usePublishedLessons = () => {
  return useQuery({
    queryKey: ["lessons", "published"],
    queryFn: () => lessonAPI.getPublished(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useLessonsByLevel = (level: string) => {
  return useQuery({
    queryKey: ["lessons", "level", level],
    queryFn: () => lessonAPI.getByLevel(level),
    staleTime: 1000 * 60 * 5,
  });
};

export const useLessonsByCategory = (category: string) => {
  return useQuery({
    queryKey: ["lessons", "category", category],
    queryFn: () => lessonAPI.getByCategory(category),
    staleTime: 1000 * 60 * 5,
  });
};
