import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;

let failedQueue = [];

const processQueue = (error = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // ❌ no config means unknown axios error
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // ❌ don't intercept refresh endpoint itself
    if (
      originalRequest.url?.includes(
        "/api/auth/refresh-token"
      )
    ) {
      return Promise.reject(error);
    }

    // 🔐 access token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // ⏳ queue pending requests while refresh running
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () =>
              resolve(api(originalRequest)),
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        // 🔄 refresh access token
        await api.post("/api/auth/refresh-token");

        processQueue();

        // ✅ retry original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;