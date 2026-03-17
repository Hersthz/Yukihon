import apiClient from "@/lib/apiClient";

export const dictionaryApi = {
  search: (query: string) => apiClient.request(`/api/dictionary/search?q=${encodeURIComponent(query)}`),
  getDetail: (id: number) => apiClient.request(`/api/dictionary/${id}`),
};
