import { useCallback, useEffect, useState } from "react";
import { reminderApi, type ReminderSummary } from "@/api";

const EMPTY_SUMMARY: ReminderSummary = {
  totalCount: 0,
  urgentCount: 0,
  items: [],
};

export const useReminders = (enabled: boolean) => {
  const [summary, setSummary] = useState<ReminderSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setSummary(EMPTY_SUMMARY);
      return;
    }

    try {
      setLoading(true);
      setSummary(await reminderApi.getSummary());
    } catch {
      setSummary(EMPTY_SUMMARY);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    summary,
    loading,
    refresh,
  };
};
