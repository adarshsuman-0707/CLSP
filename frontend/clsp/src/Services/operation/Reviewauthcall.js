import apiConnector from "../apiconfig.js"
import { endpoint } from "../api.js";
const {ADD_REVIEW,REVIEW_DETAILS} = endpoint;

export const addreview = async (token,body) => {
    try {
      const response = await apiConnector.post(ADD_REVIEW,body,
         { headers: { Authorization: `Bearer ${token}` } });
        console.log(response.data);
      return response.data;
    }       catch (error) { 
        throw error.response?.data || "Failed to fetch history!";
    }
  }
export const getReviewDetails = async (token) => {
    try {
      const response = await apiConnector.get(REVIEW_DETAILS,
          { headers: { Authorization: `Bearer ${token}` } });
        console.log(response.data,"backend se review details");
      return response.data;
    }       catch (error) {
        throw error.response?.data || "Failed to fetch review details!";
    }
  }