import apiConnector from "../apiconfig.js"
import { endpoint } from "../api.js";
const {LOGIN,SIGN_UP,VERIFY_EMAIL_OTP,VERIFY_PHONE_OTP,REQ_EMAIL_OTP,REQ_PHONE_OTP,RESET_PASS,FORGOT_PASS,VERIFY_RESET,USER_PROFILE,UPDATE_PROFILE,DELETE_PROFILE} =endpoint;


// 🔹 Fetch Orders
export const LoginUser = async (data) => {
  try {
    const response = await apiConnector.post(LOGIN,data);

    console.log(response.data)
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to Login user!";
  }
};

// 🔹 Place New Order
export const SignupUser = async (data) => {
  try {
    const response = await apiConnector.post(SIGN_UP, data);
    console.log(response.data, " Signmup");
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to Signup User!";
  }
};

export const verifyEmailOtp = async (data) => {
    try {
      const response = await apiConnector.post(VERIFY_EMAIL_OTP, data);
      console.log(response.data, "VERifEmail");

      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to verifyEmailOtp User!";
    }
  };
  export const verifyPhoneOtp = async (data) => {
    try {
      const response = await apiConnector.post(VERIFY_PHONE_OTP, data);
      console.log(response.data, "VerifyPhone");
      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to Verifyphoneotp User!";
    }
  };

  export const requestPhoneOtp = async (data) => {
    try {
      const response = await apiConnector.post(REQ_PHONE_OTP, data);
      console.log(response.data, "reqPhone");

      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to REQUEST_PHONE_OTP User!";
    }
  };
  export const requestEmailOtp = async (data) => {
    try {
      const response = await apiConnector.post(REQ_EMAIL_OTP, data);
      console.log(response.data, "reqEmail");

      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to RewEmailOTP User!";
    }
  };
  
  export const requestPasswordReset = async (data) => {
    try {
      const response = await apiConnector.post(FORGOT_PASS, data);
      console.log(response.data, "reqEmail");

      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to reqPassword User!";
    }
  };

  export const verifyOtp = async (data) => {
    try {
      const response = await apiConnector.post(VERIFY_RESET, data);
      console.log(response.data, "reqEmail");

      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to VERIFYresetOTP User!";
    }
  };
  export const resetPassword = async (data) => {
    try {
      const response = await apiConnector.post(RESET_PASS, data);
      console.log(response.data, "resetPAssword");

      return response.data;
    } catch (error) {
      throw error.response?.data || "Failed to ChangePassword User!";
    }
  };


  export const userProfile =async (token)=>{
    try {
      const response = await apiConnector.get(USER_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      return response?.data;
    } catch (error) {
      throw error.response?.data || "Failed to ChangePassword User!";
    }
  }
  export const updateProfile =async (data,token)=>{
    try {
      const response = await apiConnector.post(UPDATE_PROFILE, data ,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      return response?.data;
    } catch (error) {
      throw error.response?.data ||  "Failed to ChangePassword User!";
    }
  }
  export const deleteProfile = async (userId, token) => {
    try {
      console.log(userId, "from authCall");
  
      const response = await apiConnector.delete(
        `${DELETE_PROFILE.replace(":id", userId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log(response.data);
      return response?.data;
    } catch (error) {
      console.error("Delete Profile Error:", error);
      throw error.response?.data || "Failed to Delete User!";
    }
  };
  

  