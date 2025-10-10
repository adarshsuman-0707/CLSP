const API_BASE_URL = "http://localhost:5000/api/"; // Replace with your API URL
export const endpoint = {
    //auth 
    LOGIN: API_BASE_URL + "auth/login",
    SIGN_UP: API_BASE_URL + "auth/signup",
    VERIFY_EMAIL_OTP: API_BASE_URL + "auth/verify-email-otp",
    VERIFY_PHONE_OTP: API_BASE_URL + "auth/verify-phone-otp",
    REQ_EMAIL_OTP: API_BASE_URL + "auth/request-email-otp",
    REQ_PHONE_OTP: API_BASE_URL + "auth/request-phone-otp",
    FORGOT_PASS: API_BASE_URL + "auth/forgot-password",
    RESET_PASS: API_BASE_URL + "auth/reset-password",
    VERIFY_RESET: API_BASE_URL + "auth/verify-reset-otp",
    RECIEVE_EMAIL: API_BASE_URL + "auth/public-info",
    // USer Profile
    USER_PROFILE: API_BASE_URL + "user/userProfile",
    UPDATE_PROFILE:API_BASE_URL+ "user/updateUser",
    DELETE_PROFILE:API_BASE_URL + "user/deleteProfile/:id",
    BOOKED_SERVICES:API_BASE_URL + "user/book/:serviceId/slot/:slotId",
    SAVE_SERVICE:API_BASE_URL + "user/saveService/:serviceId",
    GET_SAVE_SERVICE:API_BASE_URL+"user/getUserSavedService",
    REMOVE_SAVE_SERVICE:API_BASE_URL+"user/removeSavedService/:serviceId",
    
    // Review
        ADD_REVIEW:API_BASE_URL+"user/addReview",
        COMPLETED_DELIVERIES:API_BASE_URL+"user/completedDeliveries",
        REVIEW_DETAILS:API_BASE_URL+"user/getReviewDetails",

    //services userside show 
    FETCH_SERVICE : API_BASE_URL+"service/services",

    //services facility  for serviceman 
    ADD_SERVICE:API_BASE_URL+"service/add",
    UPDATE_SERVICE:API_BASE_URL+"service/:serviceId/slot/:slotId",
    DELETE_SERVICE:API_BASE_URL+"service/:serviceId/slots/:slotId",
    BOOKED_REQUESTS:API_BASE_URL+"service/:serviceId/requests",
    UPDATE_BOOKING_STATUS:API_BASE_URL+"service/:serviceId/slot/:slotId/status",
    ///Service Status Approve and reject functionality yh jo hai put ke sath chalegi apni theekhai 
    STATUS_UPDATE:API_BASE_URL+"service/:serviceId/slot/:slotId/status",

    UPDATE_SERVICE_DATA:API_BASE_URL+"service/:serviceId",
    ADD_SLOTS:API_BASE_URL+"service/:serviceId/slots",
    DELIVERY_STATUS:API_BASE_URL+"service/:serviceId/slot/:slotId/delivery",    
    GET_REVIEWS:API_BASE_URL+"service/service/getReviewDetails",

    // Notification
    ADD_NOTIFICATION:API_BASE_URL+"Notification/add",
    GET_NOTIFICATION:API_BASE_URL+"Notification/list",
    MARK_AS_READ:API_BASE_URL+"Notification/:id/read",

    //Payment Section
    MAKE_PAYMENT:API_BASE_URL+"payment/makePayment",
    VERIFY_PAYMENT:API_BASE_URL+"payment/verify"
}
export default API_BASE_URL;
