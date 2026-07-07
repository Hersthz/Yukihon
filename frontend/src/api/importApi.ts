import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

/** FE-side union for the column-mapping dropdown (DTO mapping is a plain string[]). */
export type ImportField =
  | "FRONT"
  | "BACK"
  | "HINT"
  | "READING"
  | "ROMAJI"
  | "ONYOMI"
  | "KUNYOMI"
  | "EXAMPLE"
  | "EXAMPLE_TRANSLATION"
  | "NOTE"
  | "IMAGE"
  | "AUDIO"
  | "TAGS"
  | "IGNORE";

/** How duplicate FRONT rows are treated on confirm. */
export type DuplicateStrategy = "SKIP" | "UPDATE" | "CREATE_NEW";

export type ImportColumn = Schema<"Column">;

export type ImportPreview = Schema<"ImportPreviewResponse">;

export type ImportConfirm = Schema<"ImportConfirmRequest">;

export type ImportResult = Schema<"ImportResultResponse">;

export const importApi = {
  preview: async (file: File, delimiter = "AUTO"): Promise<ImportPreview> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await apiClient.fetchWithAuth(
      `/api/import/preview?delimiter=${encodeURIComponent(delimiter)}`,
      { method: "POST", body: fd }
    );
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  confirm: (body: ImportConfirm) => apiClient.post<ImportResult>("/api/import/confirm", body),
};

export default importApi;
