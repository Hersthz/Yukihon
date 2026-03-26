import { useQuery } from "@tanstack/react-query";
import { learningPathApi } from "@/api";

export const useLearningPath = () => {
  return useQuery({
    queryKey: ["learning-path"],
    queryFn: () => learningPathApi.getCurrent(),
    staleTime: 1000 * 60 * 5,
  });
};
