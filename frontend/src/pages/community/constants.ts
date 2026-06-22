import { Award, BookOpen, HelpCircle, Lightbulb, MessageSquare, Users } from "lucide-react";
import type { ChatRoom } from "@/pages/community/types";

export const CATEGORIES = [
  { value: "", label: "Tat ca", icon: Users, tone: "border-border bg-white text-foreground/80" },
  {
    value: "GENERAL",
    label: "Tong hop",
    icon: MessageSquare,
    tone: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    value: "QUESTION",
    label: "Hoi dap",
    icon: HelpCircle,
    tone: "border-amber-200 bg-amber-50 text-amber-700",
  },
  {
    value: "TIP",
    label: "Meo hoc",
    icon: Lightbulb,
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    value: "RESOURCE",
    label: "Tai lieu",
    icon: BookOpen,
    tone: "border-violet-200 bg-violet-50 text-violet-700",
  },
  {
    value: "ACHIEVEMENT",
    label: "Thanh tich",
    icon: Award,
    tone: "border-rose-200 bg-rose-50 text-rose-700",
  },
] as const;

export const JLPT_OPTIONS = ["ALL", "N5", "N4", "N3", "N2", "N1"] as const;

export const DEFAULT_CHAT_ROOMS: ChatRoom[] = [
  {
    id: "general",
    title: "General",
    description: "Phong tro chuyen tong hop cho moi nguoi hoc.",
    focus: "Open discussion",
    accent: "sky",
  },
  {
    id: "n5",
    title: "N5",
    description: "Phong lam quen voi ngu phap va tu vung nen tang.",
    focus: "Starter practice",
    accent: "emerald",
  },
  {
    id: "n4",
    title: "N4",
    description: "Phong de tang toc voi mau cau va bai tap trung cap co ban.",
    focus: "Level-up drills",
    accent: "amber",
  },
  {
    id: "kanji",
    title: "Kanji",
    description: "Phong danh rieng cho bo thu, onyomi, kunyomi va ghi nho mat chu.",
    focus: "Character lab",
    accent: "violet",
  },
  {
    id: "grammar",
    title: "Grammar",
    description: "Phong thao luan mau cau, cach dung va cac diem de nham.",
    focus: "Pattern clinic",
    accent: "rose",
  },
  {
    id: "speaking",
    title: "Speaking",
    description: "Phong luyen hoi thoai, shadowing va cac tinh huong giao tiep.",
    focus: "Conversation club",
    accent: "cyan",
  },
];
