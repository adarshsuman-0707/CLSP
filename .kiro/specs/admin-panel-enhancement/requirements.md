# Requirements Document

## Introduction

Yeh feature ek home services platform ke existing admin panel ko enhance karta hai. Abhi admin panel mein sirf Profile, Manage Packages, Notifications, aur Invoices hain. Is enhancement mein 10 nayi sections add ki jaayengi: User Management, Vendor Management, Bookings Overview, Revenue & Analytics Dashboard, Service Category Management, Reviews Moderation, Payment Management, Reports & Export, Support Messages, aur System Settings.

Platform teen roles support karta hai — `user`, `service` (vendor), aur `admin`. Frontend React.js + Bootstrap + CDBReact sidebar pe hai, backend Node.js + Express.js + MongoDB (Mongoose) pe, aur auth JWT tokens se hoti hai jo localStorage mein store hoti hai.

---

## Glossary

- **Admin_Panel**: The role-gated dashboard accessible only to users with role `admin`, rendered via `adminRenderSection()` in `Dashboard.js`.
- **Admin**: A platform user with role `admin` who has full management access.
- **User**: A platform user with role `user` who books services.
- **Vendor**: A platform user with role `service` who provides services.
- **Booking**: A record in the `Booking` collection linking a `User` to a `Service` slot with a status of `Pending`, `Confirmed`, or `Cancelled`.
- **Payment**: A record in the `Payment` collection tracking Razorpay transactions with statuses: `created`, `pending`, `success`, `failed`, `refunded`.
- **Review**: A record in the `Review` collection containing a rating (1–5), title, comment, and optional images, linked to a `Service` and a `User`.
- **Service_Category**: A string field (`category`) on the `Service` model representing the type of service (e.g., Plumbing, Carpentry).
- **ServiceCategory_Manager**: The Admin_Panel component responsible for managing Service_Category records.
- **Support_Message**: A contact form submission from a User or Vendor stored in the database, awaiting Admin response.
- **Commission_Rate**: A platform-wide percentage value that determines the Admin's cut from each completed payment.
- **System_Settings**: Platform-wide configuration values managed by the Admin, including Commission_Rate, OTP config, email templates, and site-wide toggles.
- **JWT_Token**: A JSON Web Token stored in `localStorage` used for authenticating API requests.
- **Admin_Middleware**: The `adminmiddleware.js` Express middleware that validates the JWT_Token and confirms the `admin` role before allowing access to admin-only routes.

---

## Requirements

### Requirement 1: User Management

**User Story:** As an Admin, I want to view and manage all registered users, so that I can maintain platform integrity and handle user-related issues.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a paginated list of all registered Users, showing username, email, role, contact, city, and account status.
2. WHEN the Admin searches by name or email, THE Admin_Panel SHALL filter the user list to show only matching results within 500ms.
3. WHEN the Admin clicks "Block User", THE Admin_Panel SHALL send a request to the backend to set the User's `isBlocked` flag to `true` and reflect the updated status in the list without a full page reload.
4. WHEN the Admin clicks "Unblock User" on a blocked User, THE Admin_Panel SHALL send a request to the backend to set the User's `isBlocked` flag to `false` and reflect the updated status in the list without a full page reload.
5. WHEN the Admin changes a User's role from the dropdown, THE Admin_Panel SHALL send a PATCH request to update the User's `role` field and display a success toast notification.
6. WHEN the Admin clicks "Delete User", THE Admin_Panel SHALL display a confirmation dialog before sending a DELETE request to permanently remove the User record.
7. IF the backend returns an error for any User management action, THEN THE Admin_Panel SHALL display an error toast notification with the error message.
8. THE Admin_Panel SHALL protect all User management API endpoints using Admin_Middleware so that only authenticated Admins can perform these actions.

---

### Requirement 2: Vendor / Service Provider Management

**User Story:** As an Admin, I want to view and manage all service providers, so that I can control service quality and platform trust.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a paginated list of all Vendors (users with role `service`), showing name, email, contact, city, and verification status.
2. WHEN the Admin clicks "Approve Service" on a pending service listing, THE Admin_Panel SHALL update the service's approval status to `approved` and notify the Vendor via the existing Notification system.
3. WHEN the Admin clicks "Reject Service" on a pending service listing, THE Admin_Panel SHALL update the service's approval status to `rejected` and notify the Vendor via the existing Notification system.
4. WHEN the Admin clicks "Verify Vendor", THE Admin_Panel SHALL set the Vendor's `isVerified` flag to `true` and display a success toast notification.
5. WHEN the Admin clicks "Suspend Vendor", THE Admin_Panel SHALL set the Vendor's `isBlocked` flag to `true`, preventing the Vendor from accepting new bookings, and display a success toast notification.
6. IF the backend returns an error for any Vendor management action, THEN THE Admin_Panel SHALL display an error toast notification with the error message.
7. THE Admin_Panel SHALL protect all Vendor management API endpoints using Admin_Middleware.

---

### Requirement 3: All Bookings Overview

**User Story:** As an Admin, I want to see all bookings on the platform in one place, so that I can monitor service delivery and resolve disputes.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a paginated list of all Bookings, showing booking ID, User name, Vendor name, service name, booking date, and status.
2. WHEN the Admin selects a status filter (`Pending`, `Confirmed`, `Cancelled`), THE Admin_Panel SHALL display only Bookings matching the selected status.
3. WHEN the Admin selects a date range filter, THE Admin_Panel SHALL display only Bookings whose `createdAt` date falls within the selected range.
4. WHEN the Admin clicks on a Booking row, THE Admin_Panel SHALL display a detail view showing all fields of that Booking including slot date, time, and ServiceDeliveryStatus.
5. THE Admin_Panel SHALL protect the bookings overview API endpoint using Admin_Middleware.

---

### Requirement 4: Revenue & Analytics Dashboard

**User Story:** As an Admin, I want to see revenue metrics and analytics, so that I can make informed business decisions.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a summary card showing total platform revenue calculated as the sum of all `Payment` records with status `success`.
2. THE Admin_Panel SHALL display a monthly revenue bar chart showing total successful payment amounts grouped by calendar month for the current year.
3. THE Admin_Panel SHALL display a "Top 5 Services by Booking Count" list showing service names and their total confirmed booking counts.
4. THE Admin_Panel SHALL display a "Top 5 Vendors by Revenue" list showing Vendor names and their total revenue from successful payments.
5. THE Admin_Panel SHALL display summary cards for: total registered Users, total registered Vendors, total Bookings, and total successful Payments.
6. WHEN the Admin selects a date range on the analytics dashboard, THE Admin_Panel SHALL recalculate and re-render all metrics for the selected period.
7. THE Admin_Panel SHALL protect all analytics API endpoints using Admin_Middleware.

---

### Requirement 5: Service Category Management

**User Story:** As an Admin, I want to manage service categories, so that I can keep the platform's service taxonomy organized and up to date.

#### Acceptance Criteria

1. THE ServiceCategory_Manager SHALL display a list of all distinct service categories currently present in the `Service` collection.
2. WHEN the Admin submits a new category name via the "Add Category" form, THE ServiceCategory_Manager SHALL save the new category to a dedicated `ServiceCategory` collection and display it in the list.
3. WHEN the Admin edits an existing category name, THE ServiceCategory_Manager SHALL update the category name in the `ServiceCategory` collection and update the `category` field on all `Service` documents that referenced the old name.
4. WHEN the Admin clicks "Delete Category", THE ServiceCategory_Manager SHALL display a confirmation dialog showing the count of Services using that category before sending the delete request.
5. IF a category has one or more associated Services, THEN THE ServiceCategory_Manager SHALL prevent deletion and display an error message instructing the Admin to reassign or delete those Services first.
6. THE ServiceCategory_Manager SHALL protect all category management API endpoints using Admin_Middleware.

---

### Requirement 6: Reviews Moderation

**User Story:** As an Admin, I want to view and moderate user reviews, so that I can remove inappropriate content and maintain platform quality.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a paginated list of all Reviews, showing reviewer name, service name, rating, title, comment excerpt, and submission date.
2. WHEN the Admin applies a rating filter (1–5 stars), THE Admin_Panel SHALL display only Reviews matching the selected rating.
3. WHEN the Admin clicks "View Full Review", THE Admin_Panel SHALL display a modal with the complete review content including all images.
4. WHEN the Admin clicks "Remove Review", THE Admin_Panel SHALL display a confirmation dialog and, upon confirmation, permanently delete the Review record from the database.
5. IF the backend returns an error during review deletion, THEN THE Admin_Panel SHALL display an error toast notification with the error message.
6. THE Admin_Panel SHALL protect all review moderation API endpoints using Admin_Middleware.

---

### Requirement 7: Payment Management

**User Story:** As an Admin, I want to see all platform payments and manage refund requests, so that I can ensure financial accuracy and handle disputes.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a paginated list of all Payment records, showing order ID, User name, amount, payment method, gateway, status, and date.
2. WHEN the Admin applies a status filter (`created`, `pending`, `success`, `failed`, `refunded`), THE Admin_Panel SHALL display only Payments matching the selected status.
3. WHEN the Admin clicks "Mark as Refunded" on a `success` Payment, THE Admin_Panel SHALL update the Payment's `status` to `refunded` and display a success toast notification.
4. WHEN the Admin clicks "Download Receipt" for a Payment, THE Admin_Panel SHALL trigger the existing `DownloadPaymentPDF` endpoint to download the PDF receipt.
5. THE Admin_Panel SHALL display the total count and total amount for each payment status as summary cards at the top of the Payment Management section.
6. THE Admin_Panel SHALL protect all payment management API endpoints using Admin_Middleware.

---

### Requirement 8: Reports & Export

**User Story:** As an Admin, I want to export platform data, so that I can perform offline analysis and share reports with stakeholders.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide an "Export Bookings" button that downloads all Booking records as a CSV file containing: booking ID, user name, vendor name, service name, date, status.
2. THE Admin_Panel SHALL provide an "Export Payments" button that downloads all Payment records as a CSV file containing: order ID, user name, amount, currency, method, status, date.
3. THE Admin_Panel SHALL provide an "Export Users" button that downloads all User records as a CSV file containing: username, firstname, lastname, email, role, city, state, contact.
4. WHEN the Admin selects a date range before exporting, THE Admin_Panel SHALL include only records whose `createdAt` falls within the selected range in the exported file.
5. WHERE PDF export is selected, THE Admin_Panel SHALL generate a formatted PDF report using the existing `pdfkit` dependency.
6. THE Admin_Panel SHALL protect all export API endpoints using Admin_Middleware.

---

### Requirement 9: Support / Contact Messages

**User Story:** As an Admin, I want to view and respond to contact form messages from users, so that I can provide timely support.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a paginated list of all Support_Messages, showing sender name, email, subject, submission date, and reply status (`pending` / `replied`).
2. WHEN the Admin clicks on a Support_Message, THE Admin_Panel SHALL display the full message content in a detail view.
3. WHEN the Admin submits a reply via the reply form, THE Admin_Panel SHALL send the reply to the sender's email using the existing `sendEmail` utility and update the Support_Message's status to `replied`.
4. WHEN a new Support_Message is submitted by a User, THE Admin_Panel SHALL display an unread badge count on the Support Messages sidebar menu item.
5. IF the email sending fails, THEN THE Admin_Panel SHALL display an error toast notification and retain the Support_Message status as `pending`.
6. THE Admin_Panel SHALL protect all support message API endpoints using Admin_Middleware.

---

### Requirement 10: System Settings

**User Story:** As an Admin, I want to configure platform-wide settings, so that I can control business rules and communication without code changes.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a System Settings form with fields for: Commission_Rate (percentage), OTP expiry duration (minutes), platform name, support email, and a maintenance mode toggle.
2. WHEN the Admin saves System_Settings, THE Admin_Panel SHALL send a PUT request to persist the settings in a dedicated `SystemSettings` MongoDB document and display a success toast notification.
3. WHEN the Admin updates the Commission_Rate, THE Admin_Panel SHALL validate that the value is a number between 0 and 100 before sending the request.
4. THE Admin_Panel SHALL display the current saved values as pre-filled defaults when the System Settings section is opened.
5. WHEN maintenance mode is toggled ON, THE Admin_Panel SHALL display a prominent warning banner confirming that the platform will be inaccessible to non-admin users.
6. THE Admin_Panel SHALL protect the System Settings API endpoint using Admin_Middleware so that only authenticated Admins can read or update settings.

---

### Requirement 11: Admin Sidebar Navigation

**User Story:** As an Admin, I want a complete sidebar menu with all new sections, so that I can navigate the enhanced admin panel efficiently.

#### Acceptance Criteria

1. THE Admin_Panel SHALL render all 10 new sections — User Management, Vendor Management, Bookings Overview, Revenue & Analytics, Category Management, Reviews Moderation, Payment Management, Reports & Export, Support Messages, and System Settings — as selectable items in the CDBSidebar for the `admin` role.
2. WHEN the Admin clicks a sidebar menu item, THE Admin_Panel SHALL update `activeSection` state and render the corresponding component without a full page reload.
3. THE Admin_Panel SHALL persist the `activeSection` value in `localStorage` so that the selected section is restored on page refresh.
4. WHEN the Support Messages section has unread messages, THE Admin_Panel SHALL display a numeric badge on the Support Messages sidebar item showing the unread count.
