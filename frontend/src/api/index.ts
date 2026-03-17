import { adminApi } from "@/api/adminApi";
import { authApi, authStorage } from "@/api/authApi";
import { communityApi } from "@/api/communityApi";
import { dictionaryApi } from "@/api/dictionaryApi";
import { grammarApi } from "@/api/grammarApi";
import { API_BASE_URL, getAuthHeader, request } from "@/api/httpClient";
import { lessonsApi } from "@/api/lessonsApi";
import { myWordsApi } from "@/api/myWordsApi";
import { quizzesApi } from "@/api/quizzesApi";
import { settingsApi } from "@/api/settingsApi";
import { translationApi } from "@/api/translationApi";
import type { TranslationHistoryItem } from "@/api/translationApi";
import { vocabularyApi } from "@/api/vocabularyApi";

const api = {
  baseURL: API_BASE_URL,
  getAuthHeader,
  request,
  auth: authApi,
  setAuthData: authStorage.setAuthData,
  clearAuthData: authStorage.clearAuthData,
  getStoredUser: authStorage.getStoredUser,
  isAuthenticated: authStorage.isAuthenticated,
  admin: adminApi,
  dictionary: dictionaryApi,
  community: communityApi,
  myWords: myWordsApi,
  settings: settingsApi,
  vocabulary: vocabularyApi,
  lessons: lessonsApi,
  grammar: grammarApi,
  quizzes: quizzesApi,
  translation: translationApi,
};

export type { TranslationHistoryItem };
export default api;
