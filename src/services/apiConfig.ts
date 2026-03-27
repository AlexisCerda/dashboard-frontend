export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

export const ROLE_INVITE = 0;
export const ROLE_ADMIN = 1;
export const ROLE_MEMBRE = 2;

export const getStoredToken = (): string | null => {
  const token = localStorage.getItem("sidsic_token");
  if (!token || token === "null" || token === "undefined") {
    return null;
  }
  return token;
};

export const getAuthHeaders = (isFormData: boolean = false): Record<string, string> => {
  const token = getStoredToken();
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...getAuthHeaders(isFormData),
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });

  if ((response.status === 401 || response.status === 403) && !endpoint.includes("/auth/")) {
    console.warn("Token expiré ou invalide. Déconnexion automatique.");
    
    localStorage.removeItem("sidsic_token");
    window.location.href = "/login"; 
    throw new Error("Session expirée, redirection en cours...");
  }

  return response;
};