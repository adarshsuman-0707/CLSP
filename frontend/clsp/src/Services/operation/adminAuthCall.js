import apiConnector from "../apiconfig.js";
import { endpoint } from "../api.js";

const {
  ADMIN_USERS,
  ADMIN_USER_BLOCK,
  ADMIN_USER_ROLE,
  ADMIN_USER_DELETE,
  ADMIN_VENDORS,
  ADMIN_VENDOR_VERIFY,
  ADMIN_VENDOR_SUSPEND,
  ADMIN_VENDOR_SERVICES,
  ADMIN_SERVICE_APPROVAL,
  ADMIN_BOOKINGS,
  ADMIN_BOOKING_DETAIL,
  ADMIN_ANALYTICS,
  ADMIN_CATEGORIES,
  ADMIN_CATEGORY_DETAIL,
  ADMIN_REVIEWS,
  ADMIN_REVIEW_DELETE,
  ADMIN_PAYMENTS,
  ADMIN_PAYMENT_REFUND,
  ADMIN_EXPORT_BOOKINGS,
  ADMIN_EXPORT_PAYMENTS,
  ADMIN_EXPORT_USERS,
  ADMIN_SUPPORT,
  ADMIN_SUPPORT_REPLY,
  ADMIN_SETTINGS,
} = endpoint;

// ─── User Management ────────────────────────────────────────────────────────

/** GET /api/admin/users — paginated user list with optional search */
export const getUsers = async (params = {}, token) => {
  try {
    const res = await apiConnector.get(ADMIN_USERS, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch users!";
  }
};

/** PATCH /api/admin/users/:id/block — toggle isBlocked */
export const blockUser = async (userId, token) => {
  try {
    const url = ADMIN_USER_BLOCK.replace(":id", userId);
    const res = await apiConnector.patch(url, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to block/unblock user!";
  }
};

/** PATCH /api/admin/users/:id/role — change user role */
export const changeUserRole = async (userId, role, token) => {
  try {
    const url = ADMIN_USER_ROLE.replace(":id", userId);
    const res = await apiConnector.patch(url, { role }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to change user role!";
  }
};

/** DELETE /api/admin/users/:id — permanently delete a user */
export const deleteUser = async (userId, token) => {
  try {
    const url = ADMIN_USER_DELETE.replace(":id", userId);
    const res = await apiConnector.delete(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to delete user!";
  }
};

// ─── Vendor Management ───────────────────────────────────────────────────────

/** GET /api/admin/vendors — paginated vendor list (role=service) */
export const getVendors = async (params = {}, token) => {
  try {
    const res = await apiConnector.get(ADMIN_VENDORS, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch vendors!";
  }
};

/** PATCH /api/admin/vendors/:id/verify — set isVerified=true */
export const verifyVendor = async (vendorId, token) => {
  try {
    const url = ADMIN_VENDOR_VERIFY.replace(":id", vendorId);
    const res = await apiConnector.patch(url, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to verify vendor!";
  }
};

/** PATCH /api/admin/vendors/:id/suspend — set isBlocked=true */
export const suspendVendor = async (vendorId, token) => {
  try {
    const url = ADMIN_VENDOR_SUSPEND.replace(":id", vendorId);
    const res = await apiConnector.patch(url, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to suspend vendor!";
  }
};

/** GET /api/admin/vendors/:id/services — list all services for a vendor */
export const getVendorServices = async (vendorId, token) => {
  try {
    const url = ADMIN_VENDOR_SERVICES.replace(":id", vendorId);
    const res = await apiConnector.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch vendor services!";
  }
};

/** PATCH /api/admin/services/:id/approval — approve or reject a service */
// Backend expects { status: "approved" | "rejected" } NOT { approvalStatus }
export const updateServiceApproval = async (serviceId, approvalStatus, token) => {
  try {
    const url = ADMIN_SERVICE_APPROVAL.replace(":id", serviceId);
    const res = await apiConnector.patch(url, { status: approvalStatus }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to update service approval!";
  }
};

// ─── Bookings ────────────────────────────────────────────────────────────────

/** GET /api/admin/bookings — paginated bookings with optional status/date filters */
export const getBookings = async (params = {}, token) => {
  try {
    const res = await apiConnector.get(ADMIN_BOOKINGS, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch bookings!";
  }
};

/** GET /api/admin/bookings/:id — single booking detail */
export const getBookingDetail = async (bookingId, token) => {
  try {
    const url = ADMIN_BOOKING_DETAIL.replace(":id", bookingId);
    const res = await apiConnector.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch booking detail!";
  }
};

// ─── Analytics ───────────────────────────────────────────────────────────────

/** GET /api/admin/analytics — summary cards, monthly revenue, top services/vendors */
export const getAnalytics = async (params = {}, token) => {
  try {
    const res = await apiConnector.get(ADMIN_ANALYTICS, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch analytics!";
  }
};

// ─── Category Management ─────────────────────────────────────────────────────

/** GET /api/admin/categories — list all service categories */
export const getCategories = async (token) => {
  try {
    const res = await apiConnector.get(ADMIN_CATEGORIES, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch categories!";
  }
};

/** POST /api/admin/categories — create a new category */
export const createCategory = async (categoryData, token) => {
  try {
    const res = await apiConnector.post(ADMIN_CATEGORIES, categoryData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to create category!";
  }
};

/** PUT /api/admin/categories/:id — rename category (cascades to Services) */
export const updateCategory = async (categoryId, categoryData, token) => {
  try {
    const url = ADMIN_CATEGORY_DETAIL.replace(":id", categoryId);
    const res = await apiConnector.put(url, categoryData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to update category!";
  }
};

/** DELETE /api/admin/categories/:id — delete category (blocked if services exist) */
export const deleteCategory = async (categoryId, token) => {
  try {
    const url = ADMIN_CATEGORY_DETAIL.replace(":id", categoryId);
    const res = await apiConnector.delete(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to delete category!";
  }
};

// ─── Reviews Moderation ──────────────────────────────────────────────────────

/** GET /api/admin/reviews — paginated reviews with optional rating filter */
export const getReviews = async (params = {}, token) => {
  try {
    const res = await apiConnector.get(ADMIN_REVIEWS, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch reviews!";
  }
};

/** DELETE /api/admin/reviews/:id — permanently delete a review */
export const deleteReview = async (reviewId, token) => {
  try {
    const url = ADMIN_REVIEW_DELETE.replace(":id", reviewId);
    const res = await apiConnector.delete(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to delete review!";
  }
};

// ─── Payment Management ──────────────────────────────────────────────────────

/** GET /api/admin/payments — paginated payments with optional status filter */
export const getPayments = async (params = {}, token) => {
  try {
    const res = await apiConnector.get(ADMIN_PAYMENTS, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch payments!";
  }
};

/** PATCH /api/admin/payments/:id/refund — mark a success payment as refunded */
export const markRefunded = async (paymentId, token) => {
  try {
    const url = ADMIN_PAYMENT_REFUND.replace(":id", paymentId);
    const res = await apiConnector.patch(url, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to mark payment as refunded!";
  }
};

// ─── Reports & Export ────────────────────────────────────────────────────────

/**
 * GET /api/admin/export/:type — download CSV as a blob
 * @param {"bookings"|"payments"|"users"} type
 * @param {{ dateFrom?: string, dateTo?: string }} params
 */
export const exportCSV = async (type, params = {}, token) => {
  const urlMap = {
    bookings: ADMIN_EXPORT_BOOKINGS,
    payments: ADMIN_EXPORT_PAYMENTS,
    users:    ADMIN_EXPORT_USERS,
  };

  const url = urlMap[type];
  if (!url) throw new Error(`Unknown export type: ${type}`);

  try {
    const res = await apiConnector.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      params,
      responseType: "blob",
    });
    return res.data; // Blob — caller creates an object URL and triggers download
  } catch (error) {
    throw error.response?.data || `Failed to export ${type} CSV!`;
  }
};

// ─── Support Messages ────────────────────────────────────────────────────────

/** GET /api/admin/support — paginated support messages (admin only) */
export const getSupportMessages = async (params = {}, token) => {
  try {
    const res = await apiConnector.get(ADMIN_SUPPORT, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch support messages!";
  }
};

/** POST /api/admin/support — public endpoint: user submits a support message */
export const submitSupportMessage = async (messageData) => {
  try {
    const res = await apiConnector.post(ADMIN_SUPPORT, messageData);
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to submit support message!";
  }
};

/** PATCH /api/admin/support/:id/reply — admin replies to a support message */
export const replyToMessage = async (messageId, replyText, token) => {
  try {
    const url = ADMIN_SUPPORT_REPLY.replace(":id", messageId);
    const res = await apiConnector.patch(url, { replyText }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to send reply!";
  }
};

// ─── System Settings ─────────────────────────────────────────────────────────

/** GET /api/admin/settings — fetch current platform settings */
export const getSettings = async (token) => {
  try {
    const res = await apiConnector.get(ADMIN_SETTINGS, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch settings!";
  }
};

/** PUT /api/admin/settings — update platform settings */
export const updateSettings = async (settingsData, token) => {
  try {
    const res = await apiConnector.put(ADMIN_SETTINGS, settingsData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to update settings!";
  }
};
