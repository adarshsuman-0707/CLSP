import apiConnector from "../apiconfig.js"
import { endpoint } from "../api.js";
const {GET_SAVE_SERVICE,REMOVE_SAVE_SERVICE,SAVE_SERVICE} =endpoint;
export const getSavedServices =async(token)=>{
    try {
    const response = await apiConnector.get(GET_SAVE_SERVICE,{
        headers: { Authorization: `Bearer ${token}` },
      });
    console.log(response.data, " SavedService");
    return response.data;
  }
  catch (error) {
    throw error.response?.data || "Failed to getservice service!";
  }
}

export const unsaveService =async(token,serviceId)=>{
    try {
          const url = REMOVE_SAVE_SERVICE
            .replace(":serviceId", serviceId)
        const response = await apiConnector.delete(url,{
            headers: { Authorization: `Bearer ${token}` },
          });
          return response.data;
    }
    catch(error){
 throw error.response?.data || "Failed to delete saved service User!";
    }
}

    export const savedService =async(token,serviceId)=>{
        const url=SAVE_SERVICE.replace(":serviceId",serviceId)
        try {
            const response = await apiConnector.post(url,{},{
                headers: { Authorization: `Bearer ${token}` },
              });
              return response.data;
        } catch (error) {
            throw error.response?.data || "Failed to save service User!";
        }   

    }

    