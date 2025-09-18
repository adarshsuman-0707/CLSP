    import apiConnector from "../apiconfig.js"
    import  {endpoint}  from "../api.js";
    const {UPDATE_SERVICE,DELETE_SERVICE,ADD_SERVICE,FETCH_SERVICE,BOOKED_REQUESTS,BOOKED_SERVICES}=endpoint;
    export const serviceall = async (token) => {
        try {
            const res = await apiConnector.get(FETCH_SERVICE,{
                 headers: {
          Authorization: `Bearer ${token}`,
        },
         } );
            return res.data.data;
        } catch (error) {
            console.log(error);
            throw error.response?.data || "Failed to Fetch services!";
        }
    }
export const updateSlotBookingStatus = async (serviceId, slotId, status,token ) => {
    try {
         const url = UPDATE_SERVICE
      .replace(":serviceId", serviceId)
      .replace(":slotId", slotId);


        const res = await apiConnector.patch(url, { "isBooked": status },{
                   headers: {
          Authorization: `Bearer ${token}`,
        },
        });
        return res.data; 
    } catch (error) {
        console.log(error);
        throw error.response?.data || "Failed to update slot booking status!";
    }
};
export const deleteSlotFromService = async (serviceId, slotId,token) => {
    try {
        const url = DELETE_SERVICE
      .replace(":serviceId", serviceId)
      .replace(":slotId", slotId);
        const res = await apiConnector.delete(url,{
                   headers: {
          Authorization: `Bearer ${token}`,
        },
        });
        return res.data; 
    } catch (error) {
        console.log(error);
        throw error.response?.data || "Failed to delete slot!";
    }
};
export const addService = async (creatorId, serviceData,token ) => {
    try {
        const res = await apiConnector.post(`${ADD_SERVICE}/${creatorId}`, serviceData,{
                 headers: {
          Authorization: `Bearer ${token}`,
        },
        });
        return res.data;
    } catch (error) {
        console.log(error);
        throw error.response?.data || "Failed to add service!";
    }
};

export const BookedRequestByUser = async (serviceId,token ) => {
    try {   
         const url = BOOKED_REQUESTS
      .replace(":serviceId", serviceId);
      console.log(token)
     
        const res = await apiConnector.get(url,{
                 headers: {
          Authorization: `Bearer ${token}`,
        },
        });
        return res.data;
    } catch (error) {
        console.log(error);
        throw error.response?.data || "Failed to add service!";
    }
};
export const servicerBookedByUser = async (serviceId,slotId,token ) => {
     try {   
        const url = BOOKED_SERVICES
     .replace(":serviceId", serviceId)
      .replace(":slotId", slotId);
      console.log(token)
     
        const res = await apiConnector.post(url,{},{
                 headers: {
          Authorization: `Bearer ${token}`,
        },
        });
        return res.data;
    } catch (error) {
        console.log(error);
        throw error.response?.data || "Failed to Requested  service!";
    }
};