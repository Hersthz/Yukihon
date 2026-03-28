import { useQuery } from "@tanstack/react-query";
import { mistakeDnaApi } from "@/api";

export const useMistakeDna = () =>
  useQuery({
    queryKey: ["mistake-dna"],
    queryFn: () => mistakeDnaApi.getCurrent(),
    staleTime: 1000 * 60 * 5,
  });
