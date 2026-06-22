import apiClient from "@/lib/apiClient";

export interface ReminderItem {
  id: string;
  type: "MY_WORDS" | "KANJI_SRS" | "STORY_MODE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
  count: number;
}

export interface ReminderSummary {
  totalCount: number;
  urgentCount: number;
  items: ReminderItem[];
}

export const reminderApi = {
  getSummary: () => apiClient.get<ReminderSummary>("/api/reminders"),
};
