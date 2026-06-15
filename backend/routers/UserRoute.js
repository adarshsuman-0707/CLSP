const Router = require('express');
const route = Router();
const authMiddleware = require('../middleware/authmiddleware.js');
const upload = require('../middleware/upload.js');

const {
    userProfile,
    userDataUpdate,
    userDeleteProfile,
    UserSavedService,
    getUserSavedServices,
    removeSavedService,
    addReview,
    getCompletedDeliveries,
    getReviewDetails,
    uploadProfilePicture,
    changePassword,
    getUserSupportMessages,
    submitUserSupportMessage,
} = require('../UserController/UserDash.js');

const { bookServiceSlot } = require('../serviceController/Service.js');

// ── Profile ───────────────────────────────────────────────────────────────────
route.get('/userProfile', authMiddleware, userProfile);
route.post('/updateUser', authMiddleware, userDataUpdate);
route.delete('/deleteProfile/:id', authMiddleware, userDeleteProfile);

// ── Profile picture upload ────────────────────────────────────────────────────
// POST /api/user/uploadProfilePic  (multipart, field: "image")
route.post('/uploadProfilePic', authMiddleware, upload.single('image'), uploadProfilePicture);

// ── Change password ───────────────────────────────────────────────────────────
// POST /api/user/changePassword  { currentPassword, newPassword }
route.post('/changePassword', authMiddleware, changePassword);

// ── Booking ───────────────────────────────────────────────────────────────────
route.post('/book/:serviceId/slot/:slotId', authMiddleware, bookServiceSlot);

// ── Saved services ────────────────────────────────────────────────────────────
route.post('/saveService/:serviceId', authMiddleware, UserSavedService);
route.get('/getUserSavedService', authMiddleware, getUserSavedServices);
route.delete('/removeSavedService/:serviceId', authMiddleware, removeSavedService);

// ── Reviews ───────────────────────────────────────────────────────────────────
route.post('/addReview', authMiddleware, addReview);
route.get('/getReviewDetails', authMiddleware, getReviewDetails);

// ── History ───────────────────────────────────────────────────────────────────
route.get('/completedDeliveries', authMiddleware, getCompletedDeliveries);

// ── Support Messages ──────────────────────────────────────────────────────────
route.get('/support/my-messages', authMiddleware, getUserSupportMessages);
route.post('/support/submit', authMiddleware, submitUserSupportMessage);

module.exports = route;
