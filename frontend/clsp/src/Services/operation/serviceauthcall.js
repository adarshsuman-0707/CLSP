import apiConnector from "../apiconfig.js"
import { endpoint } from "../api.js";
const { UPDATE_SERVICE, DELETE_SERVICE,UPDATE_SERVICE_DATA,ADD_SLOTS, ADD_SERVICE, FETCH_SERVICE, BOOKED_REQUESTS, BOOKED_SERVICES, STATUS_UPDATE } = endpoint;
export const serviceall = async (token) => {
    try {
        const res = await apiConnector.get(FETCH_SERVICE, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return res.data.data;
    } catch (error) {
        console.log(error);
        throw error.response?.data || "Failed to Fetch services!";
    }
}
export const updateSlotBookingStatus = async (serviceId, slotId, status, token) => {
    try {
        const url = UPDATE_SERVICE
            .replace(":serviceId", serviceId)
            .replace(":slotId", slotId);


        const res = await apiConnector.patch(url, { "isBooked": status }, {
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
export const deleteSlotFromService = async (serviceId, slotId, token) => {
    try {
        const url = DELETE_SERVICE
            .replace(":serviceId", serviceId)
            .replace(":slotId", slotId);
        const res = await apiConnector.delete(url, {
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
export const addService = async (creatorId, serviceData, token) => {
    try {
        const res = await apiConnector.post(`${ADD_SERVICE}/${creatorId}`, serviceData, {
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

export const BookedRequestByUser = async (serviceId, token) => {
    try {
        const url = BOOKED_REQUESTS
            .replace(":serviceId", serviceId);
        console.log(token)

        const res = await apiConnector.get(url, {
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
export const servicerBookedByUser = async (serviceId, slotId, token) => {
    try {
        const url = BOOKED_SERVICES
            .replace(":serviceId", serviceId)
            .replace(":slotId", slotId);
        console.log(token)

        const res = await apiConnector.post(url, {}, {
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
export const servicerUpdateBookingStatus = async (serviceId, slotId, token, status) => {
    try {
        const url = STATUS_UPDATE
            .replace(":serviceId", serviceId)
            .replace(":slotId", slotId);
        console.log(token)

        const res = await apiConnector.put(url, { status }, {
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


export const UpdateServiceValue = async (serviceId, data, token) => {
    try {
        const url = `${UPDATE_SERVICE_DATA.replace(":serviceId", serviceId)}`;
        const response = await apiConnector.put(
            url,
            data, // ✅ removed extra { }
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log(response.data, "UpdateServiceValue");
        return response.data;
    } catch (error) {
        console.error("Error updating service:", error.response?.data || error.message);
        throw error.response?.data || "Failed to Update Service!";
    }
};

export const AddSlots_Service = async (serviceId, data, token) => {
    try {
        const url = `${ADD_SLOTS.replace(":serviceId", serviceId)}`;
        const response = await apiConnector.post(
            url,
            data, // ✅ removed extra { }
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log(response.data, "AddSlots_Service");
        return response.data;
    } catch (error) {
        console.error("Error AddSlotService in service:", error.response?.data || error.message);
        throw error.response?.data || "Failed to AddSlotService Service!";
    }
};

