import apiConnector from "../apiconfig.js";
import { endpoint } from "../api.js";

const { USER_SUPPORT_MESSAGES, USER_SUPPORT_SUBMIT } = endpoint;

/**
 * GET /api/user/support/my-messages
 * Fetch logged-in user's support messages with pagination
 */
export const getUserSupportMessages = async (params = {}, token) => {
  try {
    const res = await apiConnector.get(USER_SUPPORT_MESSAGES, {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch support messages!";
  }
};

/**
 * POST /api/user/support/submit
 * Submit a new support message
 * Body: { subject, message }
 */
export const submitUserSupportMessage = async (messageData, token) => {
  try {
    const res = await apiConnector.post(USER_SUPPORT_SUBMIT, messageData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || "Failed to submit support message!";
  }
};
