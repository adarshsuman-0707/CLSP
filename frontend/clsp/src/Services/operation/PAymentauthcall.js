import apiConnector from "../apiconfig.js";
import { endpoint } from "../api.js";

const { MAKE_PAYMENT, VERIFY_PAYMENT ,GET_PAYMENT_INFO} = endpoint;

// 🔹 Create Payment Order
export const UserPaymentCreation = async (amount, token) => {
  try {
    const response = await apiConnector.post(
      MAKE_PAYMENT,
      { amount }, // ensure it's an object
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to create payment!";
  }
};

// 🔹 Verify Payment
export const UserPaymentVerify = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  ServiceId,
  packageBookingId,
  token,
  amount,
}) => {
  try {
    const response = await apiConnector.post(
      VERIFY_PAYMENT,
      {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        ServiceId,
        packageBookingId,
        amount,
        // userId is NOT sent from frontend — backend reads it from the auth token
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Payment verification failed!";
  }
};
export const GetPaymentInfo = async (token) => {
  try {
    const response = await apiConnector.get(
      GET_PAYMENT_INFO,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || "Payment GetInfo failed!";
  }
};

export const DownloadPaymentReceiptPDF = async (paymentId, token) => {
  try {
    const url = `${GET_PAYMENT_INFO.replace('GetPaymentinfo', '')}${paymentId}/pdf`;
    const response = await apiConnector.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `receipt-${paymentId}.pdf`;
    link.click();
    window.URL.revokeObjectURL(link.href);
    return { success: true };
  } catch (error) {
    throw error.response?.data || "Failed to download receipt PDF!";
  }
};
