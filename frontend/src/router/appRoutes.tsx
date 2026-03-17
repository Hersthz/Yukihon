import AdminRoute from "@/components/AdminRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Route, Routes } from "react-router-dom";
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

const withProtectedRoute = (element: JSX.Element) => <ProtectedRoute>{element}</ProtectedRoute>;

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={withProtectedRoute(<Dashboard />)} />
      <Route path="/vocabulary" element={withProtectedRoute(<Vocabulary />)} />
      <Route path="/grammar" element={withProtectedRoute(<Grammar />)} />
      <Route path="/quiz" element={withProtectedRoute(<Quiz />)} />
      <Route path="/jlpt-lessons" element={withProtectedRoute(<JLPTLessons />)} />
      <Route path="/courses" element={withProtectedRoute(<Courses />)} />
      <Route path="/courses/:courseId" element={withProtectedRoute(<CourseDetail />)} />
      <Route path="/kanji-library" element={withProtectedRoute(<KanjiLibrary />)} />
      <Route path="/profile" element={withProtectedRoute(<Profile />)} />
      <Route path="/dictionary" element={withProtectedRoute(<Dictionary />)} />
      <Route path="/translation" element={withProtectedRoute(<Translation />)} />
      <Route path="/community" element={withProtectedRoute(<Community />)} />
      <Route path="/my-words" element={withProtectedRoute(<MyWords />)} />
      <Route path="/settings" element={withProtectedRoute(<Settings />)} />

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/content" element={<AdminContent />} />
      </Route>
    </Routes>
  );
};
