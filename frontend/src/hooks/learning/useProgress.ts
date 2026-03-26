import { useQuery } from "@tanstack/react-query";
import { progressApi, type UserProgress } from "@/api";

export const useMyProgress = () =>
  useQuery({
    queryKey: ["progress", "me"],
    queryFn: () => progressApi.getMine(),
    staleTime: 1000 * 30,
  });

export const findLessonProgress = (progress: UserProgress[] | undefined, lessonId: number) =>
  progress?.find((item) => item.lessonId === lessonId) ?? null;
