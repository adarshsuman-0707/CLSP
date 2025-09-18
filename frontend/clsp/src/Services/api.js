const API_BASE_URL = "http://localhost:5000/api/"; // Replace with your API URL
export const endpoint = {
    LOGIN: API_BASE_URL + "auth/login",
    SIGN_UP: API_BASE_URL + "auth/signup",
    VERIFY_EMAIL_OTP: API_BASE_URL + "auth/verify-email-otp",
    VERIFY_PHONE_OTP: API_BASE_URL + "auth/verify-phone-otp",
    REQ_EMAIL_OTP: API_BASE_URL + "auth/request-email-otp",
    REQ_PHONE_OTP: API_BASE_URL + "auth/request-phone-otp",
    FORGOT_PASS: API_BASE_URL + "auth/forgot-password",
    RESET_PASS: API_BASE_URL + "auth/reset-password",
    VERIFY_RESET: API_BASE_URL + "auth/verify-reset-otp",
    // USer Profile
    USER_PROFILE: API_BASE_URL + "user/userProfile",
    UPDATE_PROFILE:API_BASE_URL+ "user/updateUser",
    DELETE_PROFILE:API_BASE_URL + "user/deleteProfile/:id",
    BOOKED_SERVICES:API_BASE_URL + "user/book/:serviceId/slot/:slotId",

    //services userside show 
    FETCH_SERVICE : API_BASE_URL+"service/services",

    //services facility  for serviceman 
    ADD_SERVICE:API_BASE_URL+"service/add",
    UPDATE_SERVICE:API_BASE_URL+"service/:serviceId/slot/:slotId",
    DELETE_SERVICE:API_BASE_URL+"service/:serviceId/slots/:slotId",
    BOOKED_REQUESTS:API_BASE_URL+"service/:serviceId/requests",
    UPDATE_BOOKING_STATUS:API_BASE_URL+"service/:serviceId/slot/:slotId/status"

}
export default API_BASE_URL;
