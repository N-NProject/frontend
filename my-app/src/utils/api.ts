// src/utils/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

api.interceptors.request.use(
  config => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTcyMDg3NDc0MiwiZXhwIjoxNzIwODc4MzQyfQ.wKAfuKq5UEFsoSh0DMJsQ41gnjywYvvwLXWsUzduqpo";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

export const getBoards = async () => {
  try {
    const response = await api.get("api/v1/boards");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching boards:", error);
    throw error;
  }
};

export default api;
