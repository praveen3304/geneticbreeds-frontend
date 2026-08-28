const API_BASE_URL = "https://genetic-breeds-backend.onrender.com";

let refreshPromise = null;

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    debugLog("refresh_attempt", "starting refresh, token present: " + !!localStorage.getItem("gb_refresh_token"));
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
        debugLog("refresh_failed", "status=" + res.status);
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("gb_token");
          localStorage.removeItem("gb_refresh_token");
          localStorage.removeItem("gb_user");
          window.location.href = "/";
        }
        return null;
      }
      const data = await res.json();
      if (data.token) {
        debugLog("refresh_success", "new access token stored");
        localStorage.setItem("gb_token", data.token);
        if (data.refreshToken) {
          localStorage.setItem("gb_refresh_token", data.refreshToken);
        }
        return data.token;
      }
      return null;
    } catch (err) {
      debugLog("refresh_exception", String(err));
      console.error("Token refresh failed:", err);
      return null;
    }
  })();

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    refreshPromise = null;
  }
}

export { refreshAccessToken };

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

  if (res.status === 401) {
    const clone = res.clone();
    let data = {};
    try {
      data = await clone.json();
    } catch {
      data = {};
    }

    if (data.code === "TOKEN_EXPIRED") {
      const newToken = await refreshAccessToken();
      if (newToken) {
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

export function getDebugLog() {
  try {
    return JSON.parse(localStorage.getItem("gb_debug_log") || "[]");
  } catch {
    return [];
  }
}

export function debugLog(event, detail) {
  try {
    const log = JSON.parse(localStorage.getItem("gb_debug_log") || "[]");
    log.push({ time: new Date().toISOString(), event, detail });
    while (log.length > 50) log.shift();
    localStorage.setItem("gb_debug_log", JSON.stringify(log));
  } catch {}
}
