import AdminRoute from "@/components/AdminRoute";
import CreatorModeRoute from "@/components/CreatorModeRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

const AdminBlog = lazy(() => import("@/pages/AdminBlog"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogDetail = lazy(() => import("@/pages/BlogDetail"));
const AdminContent = lazy(() => import("@/pages/AdminContent"));
const AdminCreatorMode = lazy(() => import("@/pages/AdminCreatorMode"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminStoryMode = lazy(() => import("@/pages/AdminStoryMode"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const MetadataDrivenCrudPage = lazy(() => import("@/pages/admin/MetadataDrivenCrudPage"));
const DecksPage = lazy(() => import("@/pages/decks/DecksPage"));
const DeckStudyPage = lazy(() => import("@/pages/decks/DeckStudyPage"));
const DeckCardsPage = lazy(() => import("@/pages/decks/DeckCardsPage"));
const DeckStatsPage = lazy(() => import("@/pages/decks/DeckStatsPage"));
const DeckSettingsPage = lazy(() => import("@/pages/decks/DeckSettingsPage"));
const AiChat = lazy(() => import("@/pages/AiChat"));
const Auth = lazy(() => import("@/pages/Auth"));
const Community = lazy(() => import("@/pages/Community"));
const CourseDetail = lazy(() => import("@/pages/CourseDetail"));
const Courses = lazy(() => import("@/pages/Courses"));
const Credits = lazy(() => import("@/pages/Credits"));
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
        <Route path="/decks" element={withProtectedRoute(<DecksPage />)} />
        <Route path="/decks/:deckId/study" element={withProtectedRoute(<DeckStudyPage />)} />
        <Route path="/decks/:deckId/cards" element={withProtectedRoute(<DeckCardsPage />)} />
        <Route path="/decks/:deckId/stats" element={withProtectedRoute(<DeckStatsPage />)} />
        <Route path="/decks/:deckId/settings" element={withProtectedRoute(<DeckSettingsPage />)} />
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
        <Route path="/credits" element={withProtectedRoute(<Credits />)} />
        <Route path="/blog" element={withProtectedRoute(<Blog />)} />
        <Route path="/blog/:slug" element={withProtectedRoute(<BlogDetail />)} />
        <Route
          path="/admin/creator-mode"
          element={withProtectedRoute(
            <CreatorModeRoute>
              <AdminCreatorMode />
            </CreatorModeRoute>
          )}
        />

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/content" element={<AdminContent />} />
          <Route path="/admin/story-mode" element={<AdminStoryMode />} />
          <Route
            path="/admin/app-settings"
            element={<MetadataDrivenCrudPage entityName="AppSetting" />}
          />
          <Route path="/admin/blog" element={<AdminBlog />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};
