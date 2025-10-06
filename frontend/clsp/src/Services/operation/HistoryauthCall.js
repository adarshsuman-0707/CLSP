import apiConnector from "../apiconfig.js"
import { endpoint } from "../api.js";
const {COMPLETED_DELIVERIES} = endpoint;

export const fetchHistoryDelivered = async (token) => {
    try {
      const response = await apiConnector.get(COMPLETED_DELIVERIES,
         { headers: { Authorization: `Bearer ${token}` } });
        console.log(response.data);
      return response.data;
    }       catch (error) { 
        throw error.response?.data || "Failed to fetch history!";
    }
  }