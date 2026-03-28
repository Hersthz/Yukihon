import { Award, BookOpen, HelpCircle, Lightbulb, MessageSquare, Users } from "lucide-react";

export const CATEGORIES = [
  { value: "", label: "Tat ca", icon: Users, tone: "border-border bg-white text-foreground/80" },
  { value: "GENERAL", label: "Tong hop", icon: MessageSquare, tone: "border-sky-200 bg-sky-50 text-sky-700" },
  { value: "QUESTION", label: "Hoi dap", icon: HelpCircle, tone: "border-amber-200 bg-amber-50 text-amber-700" },
  { value: "TIP", label: "Meo hoc", icon: Lightbulb, tone: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { value: "RESOURCE", label: "Tai lieu", icon: BookOpen, tone: "border-violet-200 bg-violet-50 text-violet-700" },
  { value: "ACHIEVEMENT", label: "Thanh tich", icon: Award, tone: "border-rose-200 bg-rose-50 text-rose-700" },
] as const;

export const JLPT_OPTIONS = ["ALL", "N5", "N4", "N3", "N2", "N1"] as const;
