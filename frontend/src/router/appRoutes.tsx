import AdminRoute from "@/components/AdminRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const AdminContent = lazy(() => import("@/pages/AdminContent"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const Auth = lazy(() => import("@/pages/Auth"));
const Community = lazy(() => import("@/pages/Community"));
const CourseDetail = lazy(() => import("@/pages/CourseDetail"));
const Courses = lazy(() => import("@/pages/Courses"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Dictionary = lazy(() => import("@/pages/Dictionary"));
const Grammar = lazy(() => import("@/pages/Grammar"));
const Index = lazy(() => import("@/pages/Index"));
const JLPTLessons = lazy(() => import("@/pages/JLPTLessons"));
const KanjiDetail = lazy(() => import("@/pages/KanjiDetail"));
const KanjiLibrary = lazy(() => import("@/pages/KanjiLibrary"));
const LessonDetail = lazy(() => import("@/pages/LessonDetail"));
const MyWords = lazy(() => import("@/pages/MyWords"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Profile = lazy(() => import("@/pages/Profile"));
const Quiz = lazy(() => import("@/pages/Quiz"));
const Settings = lazy(() => import("@/pages/Settings"));
const Translation = lazy(() => import("@/pages/Translation"));
const Vocabulary = lazy(() => import("@/pages/Vocabulary"));

const withProtectedRoute = (element: JSX.Element) => <ProtectedRoute>{element}</ProtectedRoute>;

export const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading page...</div>
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={withProtectedRoute(<Dashboard />)} />
        <Route path="/vocabulary" element={withProtectedRoute(<Vocabulary />)} />
        <Route path="/grammar" element={withProtectedRoute(<Grammar />)} />
        <Route path="/quiz" element={withProtectedRoute(<Quiz />)} />
        <Route path="/jlpt-lessons" element={withProtectedRoute(<JLPTLessons />)} />
        <Route path="/lessons/:lessonId" element={withProtectedRoute(<LessonDetail />)} />
        <Route path="/courses" element={withProtectedRoute(<Courses />)} />
        <Route path="/courses/:courseId" element={withProtectedRoute(<CourseDetail />)} />
        <Route path="/kanji-library" element={withProtectedRoute(<KanjiLibrary />)} />
        <Route path="/kanji-library/:character" element={withProtectedRoute(<KanjiDetail />)} />
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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
