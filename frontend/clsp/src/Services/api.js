// const API_BASE_URL = "https://clspbackend-production.up.railway.app/api/";
//  // Replace with your API URL
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
    UPLOAD_PROFILE_PIC:API_BASE_URL + "user/uploadProfilePic",
    CHANGE_PASSWORD:API_BASE_URL + "user/changePassword",
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
    SERVICE_EVENTS: API_BASE_URL+"service/events",

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

    // Vendor service management
    VENDOR_MY_SERVICES:       API_BASE_URL+"service/vendor/my-services",
    DELETE_SERVICE_FULL:      API_BASE_URL+"service/:serviceId",
    SERVICE_CATEGORIES_PUBLIC:API_BASE_URL+"service/categories/public",

    // Notification
    ADD_NOTIFICATION:API_BASE_URL+"Notification/add",
    GET_NOTIFICATION:API_BASE_URL+"Notification/list",
    MARK_AS_READ:API_BASE_URL+"Notification/:id/read",

    //Payment Section
    MAKE_PAYMENT:API_BASE_URL+"payment/MakePayment",
    VERIFY_PAYMENT:API_BASE_URL+"payment/verify",
    GET_PAYMENT_INFO:API_BASE_URL+"payment/GetPaymentinfo",
    PAYMENT_PDF:API_BASE_URL+"payment/:paymentId/pdf",

    // Vendor / Location-based
    VENDOR_UPDATE_LOCATION:API_BASE_URL+"vendors/location",
    VENDOR_NEARBY:API_BASE_URL+"vendors/nearby",
    VENDOR_ADD_AVAILABILITY:API_BASE_URL+"vendors/availability",
    VENDOR_GET_AVAILABILITY:API_BASE_URL+"vendors/:vendorId/availability",

    // Service Packages
    PACKAGES_LIST:API_BASE_URL+"packages",
    PACKAGE_CREATE:API_BASE_URL+"packages",
    PACKAGE_DETAIL:API_BASE_URL+"packages/:id",
    PACKAGE_UPDATE:API_BASE_URL+"packages/:id",
    PACKAGE_DELETE:API_BASE_URL+"packages/:id",
    PACKAGE_BOOK:API_BASE_URL+"packages/:id/book",
    PACKAGE_MY_BOOKINGS:API_BASE_URL+"packages/bookings/my",

    // Invoice & Billing
    INVOICE_GENERATE:API_BASE_URL+"invoice/generate",
    INVOICE_MY:API_BASE_URL+"invoice/my",
    INVOICE_BY_BOOKING:API_BASE_URL+"invoice/:bookingId",
    INVOICE_PDF:API_BASE_URL+"invoice/:bookingId/pdf",

    // Admin Panel
    ADMIN_USERS:           API_BASE_URL + "admin/users",
    ADMIN_USER_BLOCK:      API_BASE_URL + "admin/users/:id/block",
    ADMIN_USER_ROLE:       API_BASE_URL + "admin/users/:id/role",
    ADMIN_USER_DELETE:     API_BASE_URL + "admin/users/:id",
    ADMIN_VENDORS:         API_BASE_URL + "admin/vendors",
    ADMIN_VENDOR_VERIFY:   API_BASE_URL + "admin/vendors/:id/verify",
    ADMIN_VENDOR_SUSPEND:  API_BASE_URL + "admin/vendors/:id/suspend",
    ADMIN_VENDOR_SERVICES: API_BASE_URL + "admin/vendors/:id/services",
    ADMIN_SERVICE_APPROVAL:API_BASE_URL + "admin/services/:id/approval",
    ADMIN_BOOKINGS:        API_BASE_URL + "admin/bookings",
    ADMIN_BOOKING_DETAIL:  API_BASE_URL + "admin/bookings/:id",
    ADMIN_ANALYTICS:       API_BASE_URL + "admin/analytics",
    ADMIN_CATEGORIES:      API_BASE_URL + "admin/categories",
    ADMIN_CATEGORY_DETAIL: API_BASE_URL + "admin/categories/:id",
    ADMIN_REVIEWS:         API_BASE_URL + "admin/reviews",
    ADMIN_REVIEW_DELETE:   API_BASE_URL + "admin/reviews/:id",
    ADMIN_PAYMENTS:        API_BASE_URL + "admin/payments",
    ADMIN_PAYMENT_REFUND:  API_BASE_URL + "admin/payments/:id/refund",
    ADMIN_EXPORT_BOOKINGS: API_BASE_URL + "admin/export/bookings",
    ADMIN_EXPORT_PAYMENTS: API_BASE_URL + "admin/export/payments",
    ADMIN_EXPORT_USERS:    API_BASE_URL + "admin/export/users",
    ADMIN_SUPPORT:         API_BASE_URL + "admin/support",
    ADMIN_SUPPORT_REPLY:   API_BASE_URL + "admin/support/:id/reply",
    ADMIN_SETTINGS:        API_BASE_URL + "admin/settings",
    ADMIN_MAINTENANCE:     API_BASE_URL + "admin/maintenance-status",
}
export default API_BASE_URL;
