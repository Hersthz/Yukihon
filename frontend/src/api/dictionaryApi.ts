import { request } from "@/api/httpClient";

export const dictionaryApi = {
  search(query: string) {
    return request(`/api/dictionary/search?q=${encodeURIComponent(query)}`);
  },

  getDetail(id: number) {
    return request(`/api/dictionary/${id}`);
  },
};
