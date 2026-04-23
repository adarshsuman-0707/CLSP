import apiConnector from "../apiconfig.js"
import { endpoint } from "../api.js";

const {
    UPDATE_SERVICE,
    DELETE_SERVICE,
    UPDATE_SERVICE_DATA,
    ADD_SLOTS,
    ADD_SERVICE,
    FETCH_SERVICE,
    BOOKED_REQUESTS,
    BOOKED_SERVICES,
    STATUS_UPDATE,
    DELIVERY_STATUS,
    VENDOR_MY_SERVICES,
    DELETE_SERVICE_FULL,
    SERVICE_CATEGORIES_PUBLIC,
} = endpoint;

// ── Fetch all services (role-filtered by backend) ────────────────────────────
export const serviceall = async (token) => {
    try {
        const res = await apiConnector.get(FETCH_SERVICE, {
            headers: { Authorization: `Bearer ${token}` },
        });
        // Backend returns { success, data: [...] }
        // Return the array directly so all callers get a plain array
        return res.data?.data ?? res.data ?? [];
    } catch (error) {
        throw error.response?.data || "Failed to Fetch services!";
    }
};

// ── Fetch admin-defined categories (for dropdown in AddServicePage) ───────────
export const getPublicCategories = async (token) => {
    try {
        const res = await apiConnector.get(SERVICE_CATEGORIES_PUBLIC, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data; // { success, data: [{_id, name}] }
    } catch (error) {
        throw error.response?.data || "Failed to fetch categories!";
    }
};

// ── Get vendor's own services with stats ─────────────────────────────────────
export const getVendorServices = async (token) => {
    try {
        const res = await apiConnector.get(VENDOR_MY_SERVICES, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to fetch vendor services!";
    }
};

// ── Delete entire service ─────────────────────────────────────────────────────
export const deleteService = async (serviceId, token) => {
    try {
        const url = DELETE_SERVICE_FULL.replace(":serviceId", serviceId);
        const res = await apiConnector.delete(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to delete service!";
    }
};

// ── Update service details ────────────────────────────────────────────────────
export const updateService = async (serviceId, data, token) => {
    try {
        const url = UPDATE_SERVICE_DATA.replace(":serviceId", serviceId);
        const res = await apiConnector.put(url, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to Update Service!";
    }
};

// ── Add slot to service ───────────────────────────────────────────────────────
export const addServiceSlot = async (serviceId, data, token) => {
    try {
        const url = ADD_SLOTS.replace(":serviceId", serviceId);
        const res = await apiConnector.post(url, data, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to add slot!";
    }
};

// ── Update slot booking status (toggle isBooked) ─────────────────────────────
export const updateSlotBookingStatus = async (serviceId, slotId, status, token) => {
    try {
        const url = UPDATE_SERVICE
            .replace(":serviceId", serviceId)
            .replace(":slotId", slotId);
        const res = await apiConnector.patch(url, { isBooked: status }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to update slot booking status!";
    }
};

// ── Delete a single slot ──────────────────────────────────────────────────────
export const deleteSlotFromService = async (serviceId, slotId, token) => {
    try {
        const url = DELETE_SERVICE
            .replace(":serviceId", serviceId)
            .replace(":slotId", slotId);
        const res = await apiConnector.delete(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to delete slot!";
    }
};

// ── Create a new service ──────────────────────────────────────────────────────
export const addService = async (creatorId, serviceData, token) => {
    try {
        const res = await apiConnector.post(`${ADD_SERVICE}/${creatorId}`, serviceData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to add service!";
    }
};

// ── Get booking requests for a service ───────────────────────────────────────
export const BookedRequestByUser = async (serviceId, token) => {
    try {
        const url = BOOKED_REQUESTS.replace(":serviceId", serviceId);
        const res = await apiConnector.get(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to fetch booking requests!";
    }
};

// ── Book / cancel a slot ──────────────────────────────────────────────────────
export const servicerBookedByUser = async (serviceId, slotId, token) => {
    try {
        const url = BOOKED_SERVICES
            .replace(":serviceId", serviceId)
            .replace(":slotId", slotId);
        const res = await apiConnector.post(url, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to book service!";
    }
};

// ── Accept / reject a booking ─────────────────────────────────────────────────
export const servicerUpdateBookingStatus = async (serviceId, slotId, token, status) => {
    try {
        const url = STATUS_UPDATE
            .replace(":serviceId", serviceId)
            .replace(":slotId", slotId);
        const res = await apiConnector.put(url, { status }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to update booking status!";
    }
};

// ── Legacy aliases (kept for backward compat) ─────────────────────────────────
export const UpdateServiceValue = updateService;
export const AddSlots_Service   = addServiceSlot;

// ── Mark service delivery completed / failed ──────────────────────────────────
export const DeliveryServiceStatus = async (serviceId, slotId, status, token) => {
    try {
        const url = DELIVERY_STATUS
            .replace(":serviceId", serviceId)
            .replace(":slotId", slotId);
        const res = await apiConnector.put(url, { status }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    } catch (error) {
        throw error.response?.data || "Failed to update delivery status!";
    }
};
