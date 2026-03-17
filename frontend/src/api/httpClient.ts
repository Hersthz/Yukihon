export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const getAuthHeader = (): Record<string, string> => {
  const token = localStorage.getItem("yukihon_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const request = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...((options.headers as Record<string, string>) || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem("yukihon_token");
      localStorage.removeItem("yukihon_user");
      window.location.href = "/auth";
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `API Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
};
