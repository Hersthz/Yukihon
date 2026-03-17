import type { ComponentType } from "react";
import AdminContent from "@/pages/AdminContent";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import Auth from "@/pages/Auth";
import Community from "@/pages/Community";
import CourseDetail from "@/pages/CourseDetail";
import Courses from "@/pages/Courses";
import Dashboard from "@/pages/Dashboard";
import Dictionary from "@/pages/Dictionary";
import Grammar from "@/pages/Grammar";
import Index from "@/pages/Index";
import JLPTLessons from "@/pages/JLPTLessons";
import KanjiLibrary from "@/pages/KanjiLibrary";
import MyWords from "@/pages/MyWords";
import Profile from "@/pages/Profile";
import Quiz from "@/pages/Quiz";
import Settings from "@/pages/Settings";
import Translation from "@/pages/Translation";
import Vocabulary from "@/pages/Vocabulary";

export interface RouteConfig {
  path: string;
  component: ComponentType;
}

export const publicRoutes: RouteConfig[] = [
  { path: "/", component: Index },
  { path: "/auth", component: Auth },
];

export const protectedRoutes: RouteConfig[] = [
  { path: "/dashboard", component: Dashboard },
  { path: "/vocabulary", component: Vocabulary },
  { path: "/grammar", component: Grammar },
  { path: "/quiz", component: Quiz },
  { path: "/jlpt-lessons", component: JLPTLessons },
  { path: "/courses", component: Courses },
  { path: "/courses/:courseId", component: CourseDetail },
  { path: "/kanji-library", component: KanjiLibrary },
  { path: "/profile", component: Profile },
  { path: "/dictionary", component: Dictionary },
  { path: "/translation", component: Translation },
  { path: "/community", component: Community },
  { path: "/my-words", component: MyWords },
  { path: "/settings", component: Settings },
];

export const adminRoutes: RouteConfig[] = [
  { path: "/admin", component: AdminDashboard },
  { path: "/admin/users", component: AdminUsers },
  { path: "/admin/content", component: AdminContent },
];