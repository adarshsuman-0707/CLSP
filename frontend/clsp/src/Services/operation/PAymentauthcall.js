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
  token,
  amount,
  userId
}) => {
  console.log(userId, " yh authcalling frontend ")
  try {
    const response = await apiConnector.post(
      VERIFY_PAYMENT,
      { razorpay_order_id, razorpay_payment_id, razorpay_signature,ServiceId,amount,userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Payment verification failed!";
  }


};
export const GetPaymentInfo=async(token)=>{
try {
    const response = await apiConnector.get(
      GET_PAYMENT_INFO,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Payment GetInfo failed!";
  }
}
