import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // 🔐 IMPORTANT for cookies
});

// Optional: response interceptor (basic error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // normalize error
    const message =
      error.response?.data?.message || "Something went wrong";

    return Promise.reject(new Error(message));
  }
);

export default api;