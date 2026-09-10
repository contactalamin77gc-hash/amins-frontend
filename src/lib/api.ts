import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 30000, // fail with a clear error instead of hanging forever if the server is unreachable
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = Cookies.get("refreshToken");
      if (!refreshToken) {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        const { accessToken, refreshToken: newRefresh } = res.data;
        Cookies.set("accessToken", accessToken, { sameSite: "lax" });
        Cookies.set("refreshToken", newRefresh, { sameSite: "lax" });
        original.headers.Authorization = `Bearer ${accessToken}`;

        return api(original);
      } catch {
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;