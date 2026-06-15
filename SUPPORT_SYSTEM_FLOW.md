# Support Messages System - Flow Diagram

## 🔄 Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SUPPORT MESSAGES SYSTEM                       │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   USER SUBMITS       │
│   SUPPORT MESSAGE    │
│   (Public Form)      │
└──────────┬───────────┘
           │
           │ POST /api/admin/support
           │ { senderName, senderEmail, subject, message }
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND: submitSupportMessage()                                  │
│  - Validates required fields                                      │
│  - Validates email format                                         │
│  - Creates new SupportMessage document                            │
│  - Status: "pending"                                              │
└──────────┬───────────────────────────────────────────────────────┘
           │
           │ Saved to MongoDB
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  DATABASE: SupportMessage Collection                              │
│  {                                                                │
│    senderName: "Rahul Kumar",                                     │
│    senderEmail: "rahul@example.com",                              │
│    subject: "Issue with booking",                                 │
│    message: "Full message text...",                               │
│    status: "pending",                                             │
│    replyText: "",                                                 │
│    repliedAt: null,                                               │
│    repliedBy: null                                                │
│  }                                                                │
└──────────┬───────────────────────────────────────────────────────┘
           │
           │ Admin logs in and navigates to Support Messages
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND: Admin Dashboard → Support Messages                     │
│  Component: SupportMessages.jsx                                   │
└──────────┬───────────────────────────────────────────────────────┘
           │
           │ GET /api/admin/support?page=1&limit=10
           │ Headers: { Authorization: "Bearer <token>" }
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND: getSupportMessages()                                    │
│  - Checks auth + admin middleware                                 │
│  - Fetches paginated messages from DB                             │
│  - Counts unread (pending) messages                               │
│  - Populates userId and repliedBy references                      │
└──────────┬───────────────────────────────────────────────────────┘
           │
           │ Returns JSON response
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND: Display Messages                                       │
│                                                                   │
│  ┌─────────────────┐  ┌──────────────────────────────────────┐  │
│  │  INBOX PANEL    │  │  DETAIL PANEL                        │  │
│  │  (Left Side)    │  │  (Right Side)                        │  │
│  │                 │  │                                      │  │
│  │  📬 Messages (6)│  │  Subject: Issue with booking         │  │
│  │                 │  │  From: Rahul Kumar                   │  │
│  │  • Rahul Kumar  │  │  <rahul@example.com>                 │  │
│  │    [Pending]    │  │  Date: May 20, 2026                  │  │
│  │  • Priya Sharma │  │                                      │  │
│  │    [Pending]    │  │  MESSAGE:                            │  │
│  │  • Amit Patel   │  │  I tried to book a plumbing service  │  │
│  │    [Pending]    │  │  but the payment failed...           │  │
│  │  • Sneha Reddy  │  │                                      │  │
│  │    [Replied]    │  │  REPLY:                              │  │
│  │                 │  │  ┌────────────────────────────────┐  │  │
│  │  [Prev] [Next]  │  │  │ Type your reply here...        │  │  │
│  │                 │  │  └────────────────────────────────┘  │  │
│  │                 │  │  [✉ Send Reply]                      │  │
│  └─────────────────┘  └──────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
           │
           │ Admin types reply and clicks "Send Reply"
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND: replyToMessage()                                       │
│  PATCH /api/admin/support/:id/reply                               │
│  Body: { replyText: "Thank you for contacting us..." }           │
│  Headers: { Authorization: "Bearer <token>" }                    │
└──────────┬───────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  BACKEND: replyToSupportMessage()                                 │
│  1. Validates replyText is not empty                              │
│  2. Finds support message by ID                                   │
│  3. Sends email to sender                                         │
│  4. Updates message status to "replied"                           │
│  5. Saves replyText, repliedAt, repliedBy                         │
└──────────┬───────────────────────────────────────────────────────┘
           │
           │ Email Sending
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  NODEMAILER: Send Email via Gmail SMTP                            │
│                                                                   │
│  To: rahul@example.com                                            │
│  Subject: Re: Issue with booking                                  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  CrowdSourced Local Source Support                         │  │
│  │                                                            │  │
│  │  Hello Rahul Kumar,                                        │  │
│  │                                                            │  │
│  │  YOUR MESSAGE:                                             │  │
│  │  I tried to book a plumbing service but the payment        │  │
│  │  failed...                                                 │  │
│  │                                                            │  │
│  │  OUR RESPONSE:                                             │  │
│  │  Thank you for contacting us. We've reviewed your         │  │
│  │  payment issue and processed a refund...                   │  │
│  │                                                            │  │
│  │  Best regards,                                             │  │
│  │  CrowdSourced Local Source Team                            │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────┬───────────────────────────────────────────────────────┘
           │
           │ Email sent successfully
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  DATABASE: Update SupportMessage                                  │
│  {                                                                │
│    status: "replied",                                             │
│    replyText: "Thank you for contacting us...",                   │
│    repliedAt: "2026-05-20T12:00:00.000Z",                         │
│    repliedBy: "admin_user_id"                                     │
│  }                                                                │
└──────────┬───────────────────────────────────────────────────────┘
           │
           │ Success response
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND: Update UI                                              │
│  - Show success toast: "Reply sent successfully!"                │
│  - Update message status badge: Pending → Replied                │
│  - Decrease unread count badge                                    │
│  - Show reply in "Previous Reply" section                         │
│  - Clear reply textarea                                           │
└───────────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Summary

### 1. Message Submission (Public)
```
User Form → POST /api/admin/support → submitSupportMessage() → MongoDB
```

### 2. Admin Views Messages
```
Admin Panel → GET /api/admin/support → getSupportMessages() → Display List
```

### 3. Admin Replies
```
Reply Form → PATCH /api/admin/support/:id/reply → replyToSupportMessage()
    ↓
Send Email (nodemailer) → Update DB → Success Response → Update UI
```

## 🗂️ File Structure

```
backend/
├── models/
│   └── SupportMessage.js          # MongoDB schema
├── adminController/
│   └── AdminController.js         # Business logic
├── routers/
│   └── AdminRoute.js              # API routes
└── seedSupportMessages.js         # Test data script

frontend/clsp/src/
├── Components/admin/
│   └── SupportMessages.jsx        # UI component
├── Services/
│   ├── api.js                     # Endpoint URLs
│   └── operation/
│       └── adminAuthCall.js       # API functions
```

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Request: GET /api/admin/support                             │
│  Headers: { Authorization: "Bearer <token>" }               │
└──────────┬──────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│  Middleware: authMiddleware                                   │
│  - Verifies JWT token                                         │
│  - Decodes user info                                          │
│  - Attaches req.user                                          │
└──────────┬──────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│  Middleware: adminMiddleware                                  │
│  - Checks req.user.role === "admin"                           │
│  - Rejects if not admin                                       │
└──────────┬──────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────┐
│  Controller: getSupportMessages()                             │
│  - Executes business logic                                    │
│  - Returns data                                               │
└───────────────────────────────────────────────────────────────┘
```

## 🎯 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Backend Model | ✅ Complete | SupportMessage.js |
| Backend Controller | ✅ Complete | All 3 functions implemented |
| Backend Routes | ✅ Complete | Registered in index.js |
| Frontend Component | ✅ Complete | Full UI with pagination |
| Frontend API Calls | ✅ Complete | All endpoints connected |
| Email Sending | ✅ Complete | Nodemailer configured |
| Test Data | ⚠️ Missing | **Run seed script!** |

## 🚀 Quick Start

```bash
# 1. Add test data
cd backend
node seedSupportMessages.js

# 2. Start backend (if not running)
npm start

# 3. Start frontend (if not running)
cd ../frontend/clsp
npm start

# 4. Login as admin and navigate to Support Messages
```

---

**Everything is ready - just add test data!** 🎉
