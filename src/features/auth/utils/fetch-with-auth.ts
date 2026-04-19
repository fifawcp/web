import { useAuthStore } from "../store/auth.store";
import { refreshToken } from "../api/client";

interface FetchWithAuthOptions extends RequestInit {
  skipRefresh?: boolean;
}

export async function fetchWithAuth(url: string, options: FetchWithAuthOptions = {}): Promise<Response> {
  const { skipRefresh = false, ...fetchOptions } = options;
  const { accessToken, setAuth, clearAuth, user } = useAuthStore.getState();

  const headers = new Headers(fetchOptions.headers);
  
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const requestOptions: RequestInit = {
    ...fetchOptions,
    headers,
    credentials: "include",
  };

  let response = await fetch(url, requestOptions);

  if (response.status === 401 && !skipRefresh) {
    const refreshResponse = await refreshToken();

    if (refreshResponse.success && refreshResponse.data && user) {
      const { access_token, expires_at } = refreshResponse.data.data;
      setAuth(access_token, expires_at, user);

      headers.set("Authorization", `Bearer ${access_token}`);
      const retryOptions: RequestInit = {
        ...fetchOptions,
        headers,
        credentials: "include",
      };

      response = await fetch(url, retryOptions);
    } else {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }

  return response;
}
