# 🔄 System Flow Diagrams

## 📦 Complete Package Booking Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 1: Browse Packages                                            │
│  ────────────────────────                                           │
│  • User visits /packages                                            │
│  • Sees list of available packages                                  │
│  • Views services included in each package                          │
│  • Checks pricing and discounts                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 2: Select Package & Schedule                                  │
│  ───────────────────────────────                                    │
│  • User clicks "Book This Package"                                  │
│  • Modal opens with booking form                                    │
│  • User selects date/time (must be future)                          │
│  • User adds optional notes                                         │
│  • User clicks "Proceed to Payment"                                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 3: Create Booking                                             │
│  ───────────────────                                                │
│  Frontend: POST /api/packages/:id/book                              │
│  Body: { scheduledDate, notes }                                     │
│                                                                      │
│  Backend: PackageController.bookPackage()                           │
│  • Validates package exists and is active                           │
│  • Validates scheduled date is in future                            │
│  • Creates PackageBooking document:                                 │
│    - status: "Pending"                                              │
│    - paymentStatus: false                                           │
│    - amountPaid: package.finalPrice                                 │
│  • Returns bookingId                                                │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 4: Initiate Payment                                           │
│  ─────────────────────                                              │
│  Frontend: POST /api/payment/makePayment                            │
│  Body: { amount: finalPrice * 100 }  // Convert to paise            │
│                                                                      │
│  Backend: PaymentController.MakePayment()                           │
│  • Creates Razorpay order                                           │
│  • Returns order details:                                           │
│    - order_id                                                       │
│    - amount                                                         │
│    - currency                                                       │
│    - key_id                                                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 5: Razorpay Payment                                           │
│  ─────────────────────────                                          │
│  Frontend: Opens Razorpay modal                                     │
│  • User enters card details                                         │
│  • User completes OTP verification                                  │
│  • Razorpay processes payment                                       │
│  • Returns payment response:                                        │
│    - razorpay_order_id                                              │
│    - razorpay_payment_id                                            │
│    - razorpay_signature                                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 6: Verify Payment                                             │
│  ───────────────────                                                │
│  Frontend: POST /api/payment/verify                                 │
│  Body: {                                                            │
│    razorpay_order_id,                                               │
│    razorpay_payment_id,                                             │
│    razorpay_signature,                                              │
│    packageBookingId,                                                │
│    amount,                                                          │
│    userId                                                           │
│  }                                                                  │
│                                                                      │
│  Backend: PaymentController.VerifyPayment()                         │
│  • Verifies Razorpay signature                                      │
│  • Updates PackageBooking:                                          │
│    - paymentStatus: true                                            │
│    - status: "Confirmed"                                            │
│  • Saves payment record                                             │
│  • Calls generateInvoice()                                          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 7: Generate Invoice                                           │
│  ─────────────────────                                              │
│  Backend: InvoiceController.generateInvoice()                       │
│  • Fetches package booking with services                            │
│  • Calculates totals and GST                                        │
│  • Generates unique invoice number                                  │
│  • Creates Invoice document:                                        │
│    - invoiceNumber: INV-YYYYMMDD-XXXXXX                             │
│    - packageBooking: bookingId                                      │
│    - items: [services with prices]                                  │
│    - totalAmount, gstAmount, finalAmount                            │
│    - companyDetails                                                 │
│  • Saves to database                                                │
│  • Returns invoice                                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Step 8: Success & Redirect                                         │
│  ───────────────────────                                            │
│  Frontend:                                                          │
│  • Shows success toast notification                                 │
│  • Redirects to /user/invoices                                      │
│  • User can view/download invoice                                   │
│                                                                      │
│  User can also:                                                     │
│  • View booking in "My Package Bookings"                            │
│  • See status: "Confirmed" (green)                                  │
│  • See payment status: "Paid" (green)                               │
│  • Click "View Invoice" button                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Payment Verification Flow (Detailed)

```
┌──────────────────────────────────────────────────────────────────┐
│                    Payment Verification                          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ Verify Signature│
                    └─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │   Valid ✅   │    │  Invalid ❌  │
            └──────────────┘    └──────────────┘
                    │                   │
                    │                   └──► Return Error
                    │
                    ▼
        ┌───────────────────────┐
        │ Update Booking Status │
        │ • paymentStatus: true │
        │ • status: Confirmed   │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Save Payment Record  │
        └───────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Generate Invoice     │
        │  (try-catch block)    │
        └───────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│ Success ✅   │        │  Failed ⚠️   │
│ Invoice ID   │        │ Log Error    │
└──────────────┘        └──────────────┘
        │                       │
        └───────────┬───────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Return Success       │
        │  invoiceGenerated:    │
        │  true/false           │
        └───────────────────────┘
```

---

## 📊 Database State Changes

```
┌─────────────────────────────────────────────────────────────────┐
│                    Initial State                                │
├─────────────────────────────────────────────────────────────────┤
│  PackageBooking: Does not exist                                 │
│  Payment: Does not exist                                        │
│  Invoice: Does not exist                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              After Booking Creation                             │
├─────────────────────────────────────────────────────────────────┤
│  PackageBooking: {                                              │
│    _id: "abc123",                                               │
│    user: userId,                                                │
│    package: packageId,                                          │
│    status: "Pending",           ◄── Initial status              │
│    paymentStatus: false,        ◄── Not paid yet                │
│    amountPaid: 1500,                                            │
│    scheduledDate: "2026-05-01T10:00:00Z"                        │
│  }                                                              │
│  Payment: Does not exist                                        │
│  Invoice: Does not exist                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           After Payment Verification                            │
├─────────────────────────────────────────────────────────────────┤
│  PackageBooking: {                                              │
│    _id: "abc123",                                               │
│    status: "Confirmed",         ◄── Updated!                    │
│    paymentStatus: true,         ◄── Updated!                    │
│    ...other fields                                              │
│  }                                                              │
│                                                                 │
│  Payment: {                                                     │
│    _id: "pay123",                                               │
│    user: userId,                                                │
│    orderId: "order_xyz",                                        │
│    amount: 1500,                                                │
│    status: "success",                                           │
│    paymentResponse: { ... }                                     │
│  }                                                              │
│                                                                 │
│  Invoice: {                                                     │
│    _id: "inv123",                                               │
│    invoiceNumber: "INV-20260421-000001",                        │
│    packageBooking: "abc123",                                    │
│    user: userId,                                                │
│    items: [                                                     │
│      { serviceName: "Plumbing", price: 500, ... },              │
│      { serviceName: "Electrical", price: 700, ... }             │
│    ],                                                           │
│    totalAmount: 1200,                                           │
│    gstAmount: 216,                                              │
│    finalAmount: 1416                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI State Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Package List Page                            │
├─────────────────────────────────────────────────────────────────┤
│  [Package Card 1]  [Package Card 2]  [Package Card 3]          │
│                                                                 │
│  User clicks "Book This Package" on Card 2                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Booking Modal                                │
├─────────────────────────────────────────────────────────────────┤
│  Package: Home Cleaning Package                                 │
│  Price: ₹1500                                                   │
│                                                                 │
│  [Date/Time Picker]                                             │
│  [Notes Textarea]                                               │
│                                                                 │
│  [Cancel]  [Proceed to Payment]  ◄── User clicks                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Razorpay Payment Modal                         │
├─────────────────────────────────────────────────────────────────┤
│  Amount: ₹1500                                                  │
│                                                                 │
│  [Card Number Input]                                            │
│  [Expiry] [CVV]                                                 │
│  [Name on Card]                                                 │
│                                                                 │
│  [Pay ₹1500]  ◄── User completes payment                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Success Toast                                │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Package booked and paid successfully!                       │
│     Invoice generated.                                          │
│                                                                 │
│  Redirecting to invoices...                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    My Invoices Page                             │
├─────────────────────────────────────────────────────────────────┤
│  🧾 My Invoices                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ INV-20260421-000001          ₹1416                      │   │
│  │ Home Cleaning Package                                   │   │
│  │ [▼ Details]  [⬇ PDF]                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔀 Alternative Flow: Pending Payment

```
User books package but closes payment modal
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│              My Package Bookings Page                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Home Cleaning Package                                   │   │
│  │ Status: Pending ⚠️                                       │   │
│  │ Payment: Pending ❌                                      │   │
│  │ Amount: ₹1500                                           │   │
│  │                                                         │   │
│  │ [💳 Pay Now]  ◄── User clicks                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                │
                ▼
        Opens Razorpay modal
                │
                ▼
        User completes payment
                │
                ▼
┌─────────────────────────────────────────────────────────────────┐
│              My Package Bookings Page (Updated)                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Home Cleaning Package                                   │   │
│  │ Status: Confirmed ✅                                     │   │
│  │ Payment: Paid ✅                                         │   │
│  │ Amount: ₹1500                                           │   │
│  │                                                         │   │
│  │ [🧾 View Invoice]                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Service vs Package Booking Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                    Service Booking                              │
├─────────────────────────────────────────────────────────────────┤
│  1. User books service slot                                     │
│  2. Service provider completes service                          │
│  3. User makes payment                                          │
│  4. Invoice auto-generated ✨                                   │
│  5. User views invoice                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Package Booking                              │
├─────────────────────────────────────────────────────────────────┤
│  1. User books package                                          │
│  2. User makes payment immediately ✨                           │
│  3. Booking status → Confirmed ✨                               │
│  4. Invoice auto-generated ✨                                   │
│  5. Services scheduled for future date                          │
└─────────────────────────────────────────────────────────────────┘

Key Difference: Package requires upfront payment
```

---

## 📱 Navigation Flow

```
                    ┌──────────────┐
                    │  Home Page   │
                    └──────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Login      │  │   Signup     │  │   Packages   │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                  ┌──────────────┐
                  │  Dashboard   │
                  └──────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Services   │  │   Packages   │  │   Invoices   │
└──────────────┘  └──────────────┘  └──────────────┘
        │                  │                  │
        │                  ▼                  │
        │         ┌──────────────┐            │
        │         │ My Package   │            │
        │         │  Bookings    │            │
        │         └──────────────┘            │
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                           ▼
                  ┌──────────────┐
                  │   Logout     │
                  └──────────────┘
```

---

**Visual Guide Version:** 1.0.0  
**Last Updated:** April 21, 2026
