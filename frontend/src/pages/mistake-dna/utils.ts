import type { MistakePattern } from "@/api";

export const severityTone: Record<MistakePattern["severity"], string> = {
  HIGH: "border-rose-200 bg-rose-50 text-rose-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  LOW: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export const severityLabel: Record<MistakePattern["severity"], string> = {
  HIGH: "High pressure",
  MEDIUM: "Watch closely",
  LOW: "Stable",
};
