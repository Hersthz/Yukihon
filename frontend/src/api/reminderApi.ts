import apiClient from "@/lib/apiClient";
import type { Schema } from "@/api/types";

export type ReminderItem = Schema<"ReminderDto">;

export type ReminderSummary = Schema<"ReminderSummaryDto">;

export const reminderApi = {
  getSummary: () => apiClient.get<ReminderSummary>("/api/reminders"),
};
