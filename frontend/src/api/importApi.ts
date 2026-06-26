import apiClient from "@/lib/apiClient";

// NOTE: hand-written until backend rebuild + `npm run gen:api`, then switch to Schema<>.
export type ImportField = "FRONT" | "BACK" | "HINT" | "EXAMPLE" | "IGNORE";

export interface ImportColumn {
  header: string;
  sample: string;
}

export interface ImportPreview {
  delimiter: string;
  headerDetected: boolean;
  totalRows: number;
  columns: ImportColumn[];
  rows: string[][];
  suggestedMapping: ImportField[];
}

export interface ImportConfirm {
  deckTitle?: string;
  deckDescription?: string;
  visibility?: string;
  mapping: string[];
  rows: string[][];
}

export interface ImportResult {
  deckId: number;
  created: number;
  skipped: number;
}

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
