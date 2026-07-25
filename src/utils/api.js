const API_BASE_URL = "https://genetic-breeds-backend.onrender.com";

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("gb_refresh_token");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      credentials: "include",
    });

    if (!res.ok) {
      // Refresh token expired — force logout
      localStorage.removeItem("gb_token");
      localStorage.removeItem("gb_refresh_token");
      localStorage.removeItem("gb_user");
      window.location.href = "/";
      return null;
    }

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("gb_token", data.token);
      if (data.refreshToken) {
        localStorage.setItem("gb_refresh_token", data.refreshToken);
      }
      return data.token;
    }
    return null;
  } catch (err) {
    console.error("Token refresh failed:", err);
    return null;
  }
}

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("gb_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // If token expired, try to refresh and retry once
  if (res.status === 401) {
    const data = await res.json().catch(() => ({}));
    if (data.code === "TOKEN_EXPIRED") {
      const newToken = await refreshAccessToken();
      if (newToken) {
        // Retry with new token
        const retryRes = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
          credentials: "include",
        });
        return retryRes;
      }
    }
  }

  return res;
}

export default apiFetch;
