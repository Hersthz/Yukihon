import apiClient from "@/lib/apiClient";

/** Upload an image/audio file (max 8MB) and get back its hosted URL. */
export const mediaApi = {
  upload: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.fetchWithAuth("/api/media/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

export default mediaApi;
