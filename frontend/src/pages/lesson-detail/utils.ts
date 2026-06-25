export const formatStatus = (status?: string | null) => {
  switch (status) {
    case "COMPLETED":
      return "Đã hoàn thành";
    case "IN_PROGRESS":
      return "Đang học";
    default:
      return "Chưa bắt đầu";
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
