import axios from "axios";

const instance = axios.create({
  baseURL: "https://real-time-investment-marketplace-808382022360.us-central1.run.app/api",
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
