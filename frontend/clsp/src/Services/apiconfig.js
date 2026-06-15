import axios from "axios";// Axios instance with base URL and JSON content type
import API_BASE_URL from "./api.js";

const apiConnector = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-logout on 401 (JWT expired / invalid)
// Show blocked/pending screen on 403
apiConnector.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code   = error.response?.data?.code;

    if (status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    } else if (status === 403 && code === "ACCOUNT_BLOCKED") {
      localStorage.clear();
      window.location.href = "/blocked";
    }
    return Promise.reject(error);
  }
);

export default apiConnector;
