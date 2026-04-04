import AdminRoute from "@/components/AdminRoute";
import CreatorModeRoute from "@/components/CreatorModeRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const AdminContent = lazy(() => import("@/pages/AdminContent"));
const AdminCreatorMode = lazy(() => import("@/pages/AdminCreatorMode"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const AiChat = lazy(() => import("@/pages/AiChat"));
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
const MistakeDna = lazy(() => import("@/pages/MistakeDna"));
const MyWords = lazy(() => import("@/pages/MyWords"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Profile = lazy(() => import("@/pages/Profile"));
const Quiz = lazy(() => import("@/pages/Quiz"));
const Settings = lazy(() => import("@/pages/Settings"));
const StudyCalendar = lazy(() => import("@/pages/StudyCalendar"));
const StoryMode = lazy(() => import("@/pages/StoryMode"));
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
        <Route path="/ai-chat" element={withProtectedRoute(<AiChat />)} />
        <Route path="/vocabulary" element={withProtectedRoute(<Vocabulary />)} />
        <Route path="/grammar" element={withProtectedRoute(<Grammar />)} />
        <Route path="/quiz" element={withProtectedRoute(<Quiz />)} />
        <Route path="/calendar" element={withProtectedRoute(<StudyCalendar />)} />
        <Route path="/jlpt-lessons" element={withProtectedRoute(<JLPTLessons />)} />
        <Route path="/lessons/:lessonId" element={withProtectedRoute(<LessonDetail />)} />
        <Route path="/mistake-dna" element={withProtectedRoute(<MistakeDna />)} />
        <Route path="/courses" element={withProtectedRoute(<Courses />)} />
        <Route path="/courses/:courseId" element={withProtectedRoute(<CourseDetail />)} />
        <Route path="/kanji-library" element={withProtectedRoute(<KanjiLibrary />)} />
        <Route path="/kanji-library/:character" element={withProtectedRoute(<KanjiDetail />)} />
        <Route path="/profile" element={withProtectedRoute(<Profile />)} />
        <Route path="/dictionary" element={withProtectedRoute(<Dictionary />)} />
        <Route path="/story-mode" element={withProtectedRoute(<StoryMode />)} />
        <Route path="/translation" element={withProtectedRoute(<Translation />)} />
        <Route path="/community" element={withProtectedRoute(<Community />)} />
        <Route path="/my-words" element={withProtectedRoute(<MyWords />)} />
        <Route path="/settings" element={withProtectedRoute(<Settings />)} />
        <Route path="/admin/creator-mode" element={withProtectedRoute(<CreatorModeRoute><AdminCreatorMode /></CreatorModeRoute>)} />

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
