import axios from "axios";
import API_BASE_URL from "./api.js";

const apiConnector = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default apiConnector;
