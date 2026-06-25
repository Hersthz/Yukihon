import { ReviewRating } from "./types";

export const ratingButtonClass: Record<ReviewRating, string> = {
  AGAIN: "bg-rose-500 text-white hover:bg-rose-400",
  HARD: "bg-amber-500 text-white hover:bg-amber-400",
  GOOD: "bg-sky-500 text-white hover:bg-sky-400",
  EASY: "bg-emerald-500 text-white hover:bg-emerald-400",
};

export const ratingLabel: Record<ReviewRating, string> = {
  AGAIN: "Lại",
  HARD: "Khó",
  GOOD: "Tốt",
  EASY: "Dễ",
};

export const formatRelativeReview = (value?: string) => {
  if (!value) return "Ôn ngay";

  const reviewDate = new Date(value);
  if (Number.isNaN(reviewDate.getTime())) {
    return "Ôn ngay";
  }

  const now = new Date();
  const diff = reviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Đến hạn hôm nay";
  if (diffDays === 1) return "Đến hạn ngày mai";
  return `Còn ${diffDays} ngày`;
};

export const formatAbsoluteDate = (value?: string) => {
  if (!value) return "Ngày";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Ngày";
  }

  return date.toLocaleDateString("vi-VN");
};
