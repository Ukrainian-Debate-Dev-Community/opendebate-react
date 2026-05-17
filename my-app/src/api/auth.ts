const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type AuthPayload = {
  email: string;
  password: string;
};

export type AuthUser = {
  email: string;
  token: string;
  id: string;
};

type AuthResponse = Partial<AuthUser> & {
  user?: Partial<AuthUser>;
  accessToken?: string;
  message?: string;
};

const normalizeAuthResponse = (
  data: AuthResponse,
  fallbackEmail: string,
): AuthUser => ({
  email: data.user?.email || data.email || fallbackEmail,
  token: data.token || data.accessToken || "",
  id: data.user?.id || data.id || "",
});

const requestAuth = async (
  endpoint: "/auth/login" | "/auth/register",
  payload: AuthPayload,
) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as AuthResponse;

  if (!response.ok) {
    throw new Error(data.message || "Authorization failed");
  }

  return normalizeAuthResponse(data, payload.email);
};

export const loginUser = (payload: AuthPayload) =>
  requestAuth("/auth/login", payload);

export const registerUser = (payload: AuthPayload) =>
  requestAuth("/auth/register", payload);
