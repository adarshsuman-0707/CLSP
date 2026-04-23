# Implementation Tasks: Admin Panel Enhancement

## Task Overview

Yeh tasks admin panel ke 10 nayi sections implement karne ke liye hain. Backend se shuru karenge, phir frontend, aur end mein tests.

---

## Phase 1: Backend Foundation

- [x] 1. Update existing models with new fields
  - [x] 1.1 Add `isBlocked: Boolean` and `isVerified: Boolean` fields to `backend/models/User.js`
  - [x] 1.2 Add `approvalStatus: { type: String, enum: ["pending","approved","rejected"], default: "pending" }` field to `backend/models/Service.js`

- [x] 2. Create new MongoDB models
  - [x] 2.1 Create `backend/models/ServiceCategory.js` with fields: name (unique, required), createdBy (ref User), isActive (Boolean), timestamps
  - [x] 2.2 Create `backend/models/SupportMessage.js` with fields: senderName, senderEmail, subject, message, userId (ref User, nullable), status (pending/replied), replyText, repliedAt, repliedBy (ref User), timestamps
  - [x] 2.3 Create `backend/models/SystemSettings.js` with fields: commissionRate (0-100), otpExpiryMinutes (1-60), platformName, supportEmail, maintenanceMode (Boolean), updatedBy (ref User), timestamps — singleton pattern

- [-] 3. Create AdminController with all handler functions
  - [x] 3.1 Create `backend/adminController/AdminController.js` — User Management handlers: `getUserList` (paginated, search by name/email), `blockUnblockUser` (toggle isBlocked), `changeUserRole` (validate enum), `deleteUser`
  - [x] 3.2 Add Vendor Management handlers to AdminController: `getVendorList` (role=service filter), `verifyVendor` (set isVerified=true), `suspendVendor` (set isBlocked=true), `updateServiceApproval` (approve/reject + send Notification)
  - [x] 3.3 Add Bookings handlers to AdminController: `getAllBookings` (paginated, filter by status + dateFrom/dateTo, populate userId+serviceId), `getBookingDetail` (single booking with all slot fields)
  - [x] 3.4 Add Analytics handler to AdminController: `getAnalytics` — total revenue (sum of success payments), monthly revenue aggregation, top 5 services by booking count, top 5 vendors by revenue, summary counts (users, vendors, bookings, payments)
  - [x] 3.5 Add Category Management handlers to AdminController: `getCategories`, `createCategory`, `updateCategory` (cascade rename to Service.updateMany), `deleteCategory` (guard: reject if services exist)
  - [x] 3.6 Add Reviews Moderation handlers to AdminController: `getReviews` (paginated, filter by rating, populate reviewer+service), `deleteReview`
  - [x] 3.7 Add Payment Management handlers to AdminController: `getPayments` (paginated, filter by status, populate user), `markRefunded` (only if status=success), payment summary cards (count+total per status)
  - [ ] 3.8 Add Export handlers to AdminController: `exportBookingsCSV`, `exportPaymentsCSV`, `exportUsersCSV` — each accepts optional dateFrom/dateTo query params, sets `Content-Type: text/csv` header
  - [x] 3.9 Add Support Message handlers to AdminController: `getSupportMessages` (paginated, unread count), `submitSupportMessage` (public, no auth), `replyToSupportMessage` (send email via sendEmail utility, set status=replied)
  - [x] 3.10 Add System Settings handlers to AdminController: `getSettings` (findOne or return defaults), `updateSettings` (findOneAndUpdate upsert, validate commissionRate 0-100)

- [x] 4. Create AdminRoute and register in index.js
  - [x] 4.1 Create `backend/routers/AdminRoute.js` — wire all 30+ endpoints to AdminController handlers, apply `authmiddleware + adminmiddleware` to all routes except `POST /api/admin/support` (public)
  - [x] 4.2 Register admin route in `backend/index.js`: `app.use('/api/admin', AdminRoutes)`

---

## Phase 2: Frontend API Layer

- [x] 5. Add admin endpoints to api.js and create adminAuthCall.js
  - [x] 5.1 Add all admin endpoint constants to `frontend/clsp/src/Services/api.js` under `// Admin Panel` section — ADMIN_USERS, ADMIN_USER_BLOCK, ADMIN_USER_ROLE, ADMIN_USER_DELETE, ADMIN_VENDORS, ADMIN_VENDOR_VERIFY, ADMIN_VENDOR_SUSPEND, ADMIN_SERVICE_APPROVAL, ADMIN_BOOKINGS, ADMIN_ANALYTICS, ADMIN_CATEGORIES, ADMIN_REVIEWS, ADMIN_PAYMENTS, ADMIN_PAYMENT_REFUND, ADMIN_EXPORT_BOOKINGS, ADMIN_EXPORT_PAYMENTS, ADMIN_EXPORT_USERS, ADMIN_SUPPORT, ADMIN_SETTINGS
  - [x] 5.2 Create `frontend/clsp/src/Services/operation/adminAuthCall.js` — export functions for all admin API calls following packageAuthCall.js pattern: getUsers, blockUser, changeUserRole, deleteUser, getVendors, verifyVendor, suspendVendor, updateServiceApproval, getBookings, getBookingDetail, getAnalytics, getCategories, createCategory, updateCategory, deleteCategory, getReviews, deleteReview, getPayments, markRefunded, exportCSV, getSupportMessages, submitSupportMessage, replyToMessage, getSettings, updateSettings

---

## Phase 3: Frontend Admin Components

- [x] 6. Create UserManagement.jsx
  - [x] 6.1 Create `frontend/clsp/src/Components/admin/UserManagement.jsx` — paginated table showing username, email, role, contact, city, isBlocked status; search input filters by name/email; Block/Unblock toggle button per row; role dropdown (user/service/admin) with PATCH on change; Delete button with window.confirm dialog; react-toastify for success/error; loading spinner on fetch

- [x] 7. Create VendorManagement.jsx
  - [x] 7.1 Create `frontend/clsp/src/Components/admin/VendorManagement.jsx` — paginated table of vendors (role=service); columns: name, email, contact, city, isVerified badge; Verify button (sets isVerified=true); Suspend button (sets isBlocked=true); expandable row or modal showing vendor's services with Approve/Reject buttons per service; toast notifications

- [x] 8. Create BookingsOverview.jsx
  - [x] 8.1 Create `frontend/clsp/src/Components/admin/BookingsOverview.jsx` — paginated table with columns: booking ID, user name, vendor name, service name, date, status badge; status filter dropdown (All/Pending/Confirmed/Cancelled); date range inputs (dateFrom, dateTo); clickable row opens detail modal showing all booking fields including slot date/time and ServiceDeliveryStatus; toast on error

- [x] 9. Create RevenueAnalytics.jsx
  - [x] 9.1 Install chart.js and react-chartjs-2 if not present: `npm install chart.js react-chartjs-2`
  - [x] 9.2 Create `frontend/clsp/src/Components/admin/RevenueAnalytics.jsx` — summary cards row (total revenue, total users, total vendors, total bookings, total payments); monthly revenue bar chart using Chart.js; Top 5 Services list with booking counts; Top 5 Vendors list with revenue amounts; date range picker to filter all metrics; loading spinner

- [x] 10. Create CategoryManagement.jsx
  - [x] 10.1 Create `frontend/clsp/src/Components/admin/CategoryManagement.jsx` — list of all categories with service count per category; Add Category form (name input + submit); inline edit (click category name → editable input → save); Delete button shows confirmation with service count warning; blocks deletion if services > 0 with error toast; success toast on all operations

- [x] 11. Create ReviewsModeration.jsx
  - [x] 11.1 Create `frontend/clsp/src/Components/admin/ReviewsModeration.jsx` — paginated table: reviewer name, service name, star rating display, title, comment excerpt (50 chars), date; rating filter (1-5 stars + All); "View Full" button opens Bootstrap modal with complete review + images; "Remove" button with confirm dialog → DELETE request; toast notifications

- [x] 12. Create PaymentManagement.jsx
  - [x] 12.1 Create `frontend/clsp/src/Components/admin/PaymentManagement.jsx` — summary cards at top (count + total amount per status: created/pending/success/failed/refunded); paginated table: order ID, user name, amount (₹), method, gateway, status badge, date; status filter dropdown; "Mark Refunded" button (only visible for success payments) with confirm dialog; "Download Receipt" button triggers existing PDF endpoint; toast notifications

- [x] 13. Create ReportsExport.jsx
  - [x] 13.1 Create `frontend/clsp/src/Components/admin/ReportsExport.jsx` — date range picker (dateFrom, dateTo inputs); three export cards: "Export Bookings CSV", "Export Payments CSV", "Export Users CSV" — each triggers GET request with date params and downloads file via blob URL; loading state per button; toast on error

- [x] 14. Create SupportMessages.jsx
  - [x] 14.1 Create `frontend/clsp/src/Components/admin/SupportMessages.jsx` — two-panel layout: left panel = paginated message list (sender name, subject, date, pending/replied badge); right panel = selected message detail (full message content) + reply textarea + Send Reply button; on reply: PATCH request → email sent → status updates to replied; unread count displayed in component header; toast notifications

- [x] 15. Create SystemSettings.jsx
  - [x] 15.1 Create `frontend/clsp/src/Components/admin/SystemSettings.jsx` — form with fields: Commission Rate (number input, 0-100 validation), OTP Expiry Minutes (number, 1-60), Platform Name (text), Support Email (email), Maintenance Mode (toggle switch); pre-fills with current saved values on load; maintenance mode ON shows prominent red warning banner; Save button → PUT request → success toast; client-side validation before submit

---



- [x] 16. Update Dashboard.js for admin panel
  - [x] 16.1 Import all 10 new admin components in `frontend/clsp/src/Profile/Dashboard.js`
  - [x] 16.2 Extend `adminRenderSection()` switch with 10 new cases: userManagement, vendorManagement, bookingsOverview, revenueAnalytics, categoryManagement, reviewsModeration, paymentManagement, reportsExport, supportMessages, systemSettings
  - [x] 16.3 Add unread support message count state — fetch `GET /api/admin/support?countOnly=true` on mount when role=admin, store in state
  - [x] 16.4 Extend CDBSidebar admin section with 10 new menu items: Users (icon: users), Vendors (icon: store), Bookings (icon: calendar), Analytics (icon: chart-bar), Categories (icon: tags), Reviews (icon: star), Payments (icon: credit-card), Reports (icon: file-export), Support (icon: envelope with badge), Settings (icon: cog)

---

## Phase 5: Property-Based Tests

- [-] 17. Setup test environment and install fast-check
  - [-] 17.1 Install fast-check in backend: `cd backend && npm install --save-dev fast-check jest`
  - [ ] 17.2 Add jest config to `backend/package.json`: `"test": "jest --testPathPattern=tests/"` and create `backend/tests/` directory

- [x] 18. Write property-based tests for filter and aggregation logic
  - [x] 18.1 Create `backend/tests/adminFilters.test.js` — extract pure filter/aggregation helper functions from AdminController and test: P1 (user search filter correctness), P4 (vendor role filter), P6 (booking status filter), P7 (booking date range filter), P14 (review rating filter) — minimum 100 iterations each using fast-check
  - [x] 18.2 Create `backend/tests/adminAggregations.test.js` — test pure aggregation helpers: P8 (revenue aggregation correctness), P9 (monthly revenue grouping), P10 (top-N ranking correctness), P15 (payment status summary), P20 (unread badge count accuracy) — minimum 100 iterations each
  - [x] 18.3 Create `backend/tests/adminMutations.test.js` — test pure mutation/validation functions: P2 (block/unblock round-trip), P3 (role update persistence), P5 (service approval status), P16 (refund status mutation), P19 (support reply status transition) — minimum 100 iterations each
  - [ ] 18.4## Phase 4: Dashboard Integration Create `backend/tests/adminExport.test.js` — test CSV generation helpers: P17 (CSV field completeness), P18 (export date range filter) — minimu
  m 100 iterations each
  - [x] 18.5 Create `backend/tests/adminSettings.test.js` — test settings validation and persistence: P21 (commission rate validation: 0-100 accept, outside reject), P22 (settings round-trip persistence) — minimum 100 iterations each
  - [x] 18.6 Create `backend/tests/adminCategory.test.js` — test category logic: P11 (category distinctness), P12 (category rename cascade), P13 (category deletion guard) — minimum 100 iterations each
  - [x] 18.7 Create `backend/tests/adminSidebar.test.js` — test sidebar state mapping: P23 (section key → localStorage mapping) using fast-check with `fc.constantFrom` over all 10 section keys — minimum 100 iterations

- [x] 19. Run all property-based tests and verify they pass
  - [x] 19.1 Run `cd backend && npm test` — all 23 property tests must pass with 0 failures
