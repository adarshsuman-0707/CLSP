import apiConnector from "../apiconfig.js"
import { endpoint } from "../api.js";
const {ADD_NOTIFICATION,GET_NOTIFICATION,MARK_AS_READ} = endpoint;
export  const NotificationAdd = async (token,body) => {
    try {
      const response = await apiConnector.post(ADD_NOTIFICATION,body,
            { headers: { Authorization: `Bearer ${token}` } });
        console.log(response.data);
      return response.data;
    }
        catch (error) {
        throw error.response?.data || "Failed to add notification!";
            
    }
  }
export  const getNotification = async (token) => {
    try {
      const response = await apiConnector.get(GET_NOTIFICATION,    
            { headers: { Authorization: `Bearer ${token}` } });
        console.log(response.data);
      return response.data;
    }

        catch (error) {
        throw error.response?.data || "Failed to fetch notification!";
    }
  }
export  const markAsRead = async (token,id) => {
    try {
      const response = await apiConnector.post(MARK_AS_READ.replace(':id', id),{},
            { headers: { Authorization: `Bearer ${token}` } });
        console.log(response.data);
      return response.data;
    }   
        catch (error) {
        throw error.response?.data || "Failed to mark as read!";
    }
    }