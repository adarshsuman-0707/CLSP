import apiConnector from "../apiconfig.js";
import { endpoint } from "../api.js";

const {
  VENDOR_UPDATE_LOCATION,
  VENDOR_NEARBY,
  VENDOR_ADD_AVAILABILITY,
  VENDOR_GET_AVAILABILITY,
} = endpoint;

/** PUT /api/vendors/location — vendor sets own coordinates */
export const updateVendorLocation = async (locationData, token) => {
  try {
    const res = await apiConnector.put(VENDOR_UPDATE_LOCATION, locationData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to update vendor location!";
  }
};

/**
 * GET /api/vendors/nearby?lat=&lng=&radius=&category=
 * Returns map-ready vendor list sorted by distance/rating/availability.
 */
export const fetchNearbyVendors = async ({ lat, lng, radius = 10, category = "" }, token) => {
  try {
    const params = new URLSearchParams({ lat, lng, radius });
    if (category) params.append("category", category);

    const res = await apiConnector.get(`${VENDOR_NEARBY}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch nearby vendors!";
  }
};

/** POST /api/vendors/availability — vendor adds available time slots */
export const addVendorAvailability = async (slots, token) => {
  try {
    const res = await apiConnector.post(
      VENDOR_ADD_AVAILABILITY,
      { slots },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to add availability slots!";
  }
};

/** GET /api/vendors/:vendorId/availability */
export const getVendorAvailability = async (vendorId, token) => {
  try {
    const url = VENDOR_GET_AVAILABILITY.replace(":vendorId", vendorId);
    const res = await apiConnector.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch vendor availability!";
  }
};
