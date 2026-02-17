// src/lib/api/learningClient.ts

const API_BASE_URL = "http://localhost:8080";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Vocabulary API
export const vocabularyAPI = {
  getAll: async (token?: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch vocabulary");
    return response.json();
  },

  getById: async (id: number, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/${id}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch vocabulary");
    return response.json();
  },

  getByLevel: async (level: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/level/${level}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch vocabulary");
    return response.json();
  },

  getAllLevels: async (token?: string): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/api/vocabulary/levels`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch JLPT levels");
    return response.json();
  },
};

// Lesson API
export const lessonAPI = {
  getAll: async (token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/lessons`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch lessons");
    return response.json();
  },

  getPublished: async (token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/lessons/published`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch lessons");
    return response.json();
  },

  getById: async (id: number, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/lessons/${id}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch lesson");
    return response.json();
  },

  getByLevel: async (level: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/lessons/published/level/${level}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch lessons");
    return response.json();
  },

  getByCategory: async (category: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/lessons/published/category/${category}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch lessons");
    return response.json();
  },
};

// Grammar API
export const grammarAPI = {
  getAll: async (token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/grammar`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch grammar");
    return response.json();
  },

  getById: async (id: number, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/grammar/${id}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch grammar");
    return response.json();
  },

  getByLevel: async (level: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/grammar/level/${level}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch grammar");
    return response.json();
  },

  getAllLevels: async (token?: string): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/api/grammar/levels`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch JLPT levels");
    return response.json();
  },
};

// Quiz API
export const quizAPI = {
  getAll: async (token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/quizzes`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch quizzes");
    return response.json();
  },

  getById: async (id: number, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/quizzes/${id}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch quiz");
    return response.json();
  },

  getByLevel: async (level: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/quizzes/level/${level}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch quizzes");
    return response.json();
  },

  getByDifficulty: async (difficulty: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/quizzes/difficulty/${difficulty}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch quizzes");
    return response.json();
  },
};

// User Progress API
export const progressAPI = {
  getByUserId: async (userId: number, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/progress/user/${userId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch progress");
    return response.json();
  },

  getByStatus: async (userId: number, status: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/progress/user/${userId}/status/${status}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch progress");
    return response.json();
  },

  createProgress: async (userId: number, data: any, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/progress/user/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create progress");
    return response.json();
  },

  updateProgress: async (id: number, data: any, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/progress/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update progress");
    return response.json();
  },
};

// User Learning Stats API
export const statsAPI = {
  getStats: async (userId: number, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/stats/user/${userId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to fetch stats");
    return response.json();
  },

  updateTargetLevel: async (userId: number, level: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/stats/user/${userId}/target-level/${level}`, {
      method: "PUT",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) throw new Error("Failed to update target level");
    return response.json();
  },
};
