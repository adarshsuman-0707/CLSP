import apiConnector from "../apiconfig.js";
import { endpoint } from "../api.js";

const {
  PACKAGES_LIST,
  PACKAGE_CREATE,
  PACKAGE_DETAIL,
  PACKAGE_UPDATE,
  PACKAGE_DELETE,
  PACKAGE_BOOK,
  PACKAGE_MY_BOOKINGS,
} = endpoint;

/** GET /api/packages — list all active packages (public) */
export const fetchPackages = async () => {
  try {
    const res = await apiConnector.get(PACKAGES_LIST);
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch packages!";
  }
};

/** GET /api/packages/:id — package details with services */
export const fetchPackageById = async (id) => {
  try {
    const url = PACKAGE_DETAIL.replace(":id", id);
    const res = await apiConnector.get(url);
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch package details!";
  }
};

/** POST /api/packages — admin creates a package */
export const createPackage = async (packageData, token) => {
  try {
    const res = await apiConnector.post(PACKAGE_CREATE, packageData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to create package!";
  }
};

/** PUT /api/packages/:id — admin updates a package */
export const updatePackage = async (id, packageData, token) => {
  try {
    const url = PACKAGE_UPDATE.replace(":id", id);
    const res = await apiConnector.put(url, packageData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to update package!";
  }
};

/** DELETE /api/packages/:id — admin soft-deletes a package */
export const deletePackage = async (id, token) => {
  try {
    const url = PACKAGE_DELETE.replace(":id", id);
    const res = await apiConnector.delete(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to delete package!";
  }
};

/** POST /api/packages/:id/book — user books a package */
export const bookPackage = async (id, bookingData, token) => {
  try {
    const url = PACKAGE_BOOK.replace(":id", id);
    const res = await apiConnector.post(url, bookingData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to book package!";
  }
};

/** GET /api/packages/bookings/my — user's own package bookings */
export const fetchMyPackageBookings = async (token) => {
  try {
    const res = await apiConnector.get(PACKAGE_MY_BOOKINGS, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch package bookings!";
  }
};
