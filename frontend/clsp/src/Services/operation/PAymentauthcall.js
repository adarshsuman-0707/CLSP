import apiConnector from "../apiconfig.js"
import { endpoint } from "../api.js";
const {MAKE_PAYMENT,VERIFY_PAYMENT}=endpoint;

export const UserPaymentCreation=async(amount)=>{
    try{
 const response = await apiConnector.post(MAKE_PAYMENT,amount);

    console.log(response.data)
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to Login user!";
  }
}
export const UserPaymentVerify = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  try {
    const response = await apiConnector.post(VERIFY_PAYMENT, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    console.log(response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || "Payment verification failed!";
  }
};