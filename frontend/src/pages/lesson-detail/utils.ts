export const formatStatus = (status?: string | null) => {
  switch (status) {
    case "COMPLETED":
      return "Da hoan thanh";
    case "IN_PROGRESS":
      return "Dang hoc";
    default:
      return "Chua bat dau";
  }
};

export const estimateMinutes = (content?: string | null) => {
  const length = content?.length ?? 0;
  if (length > 5000) return 20;
  if (length > 2500) return 16;
  return 12;
};

export const parseQuizOptions = (value?: string | null): string[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch {
    return [];
  }
};
