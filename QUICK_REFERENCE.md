# 🚀 Quick Reference Card

## 📦 Package Booking Flow

### User Actions
```
1. Browse Packages → /packages
2. Click "Book This Package"
3. Select date/time + notes
4. Click "Proceed to Payment"
5. Complete Razorpay payment
6. View invoice → /user/invoices
```

### System Actions
```
1. Create PackageBooking (status: Pending, paymentStatus: false)
2. Generate Razorpay order
3. Verify payment signature
4. Update booking (status: Confirmed, paymentStatus: true)
5. Auto-generate invoice
6. Return success response
```

---

## 🔌 API Endpoints

### Package Booking
```javascript
// Book a package
POST /api/packages/:id/book
Body: { scheduledDate, notes }
Auth: Required

// Get my bookings
GET /api/packages/bookings/my
Auth: Required
```

### Payment
```javascript
// Create payment order
POST /api/payment/makePayment
Body: { amount }
Auth: Required

// Verify payment
POST /api/payment/verify
Body: {
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  packageBookingId,  // or bookingId for services
  amount,
  userId
}
Auth: Required
```

### Invoice
```javascript
// Get my invoices
GET /api/invoice/my
Auth: Required

// Download invoice PDF
GET /api/invoice/:bookingId/pdf
Auth: Required
```

---

## 💻 Frontend Components

### PackageList.jsx
```javascript
// Location: frontend/clsp/src/Components/packages/PackageList.jsx
// Purpose: Display packages + handle booking + payment
// Key Functions:
- handleBook() - Opens booking modal
- handleConfirmBooking() - Creates booking + initiates payment
- Razorpay integration
```

### MyPackageBookings.jsx
```javascript
// Location: frontend/clsp/src/Components/packages/MyPackageBookings.jsx
// Purpose: Display user's bookings + payment status
// Key Functions:
- loadBookings() - Fetch bookings
- handlePayNow() - Process pending payments
- handleViewInvoice() - Navigate to invoices
```

### InvoiceList.jsx
```javascript
// Location: frontend/clsp/src/Components/invoice/InvoiceList.jsx
// Purpose: Display all invoices (service + package)
// Key Functions:
- fetchMyInvoices() - Load invoices
- handleDownload() - Download PDF
```

---

## 🗄️ Database Schema

### PackageBooking
```javascript
{
  user: ObjectId,              // ref: User
  package: ObjectId,           // ref: ServicePackage
  amountPaid: Number,          // Price at booking time
  scheduledDate: Date,         // When service is scheduled
  status: String,              // Pending/Confirmed/Cancelled/Completed
  paymentStatus: Boolean,      // NEW: true after payment
  notes: String,               // Optional user notes
  createdAt: Date,
  updatedAt: Date
}
```

### Invoice
```javascript
{
  invoiceNumber: String,       // INV-YYYYMMDD-XXXXXX
  booking: ObjectId,           // ref: Booking (optional)
  packageBooking: ObjectId,    // ref: PackageBooking (optional)
  user: ObjectId,              // ref: User
  items: [{
    serviceName: String,
    price: Number,
    quantity: Number,
    lineTotal: Number
  }],
  totalAmount: Number,         // Before GST
  gstPercentage: Number,       // Default: 18
  gstAmount: Number,           // Calculated
  finalAmount: Number,         // Total with GST
  companyDetails: Object,
  createdAt: Date
}
```

---

## 🎨 UI Components

### Status Badges
```javascript
// Booking Status
Pending    → Yellow badge
Confirmed  → Green badge
Cancelled  → Red badge
Completed  → Blue badge

// Payment Status
Paid       → Green badge
Pending    → Red badge
```

### Action Buttons
```javascript
// Unpaid booking
<button>💳 Pay Now</button>

// Paid booking
<button>🧾 View Invoice</button>

// Invoice
<button>⬇ PDF</button>
```

---

## 🔐 Environment Variables

### Required in backend/.env
```env
# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx

# Company (for invoices)
COMPANY_NAME=CLSP Services Pvt. Ltd.
COMPANY_ADDRESS=Your Address
COMPANY_GSTIN=22AAAAA0000A1Z5
COMPANY_EMAIL=info@company.com
COMPANY_PHONE=+91-9876543210
GST_PERCENTAGE=18
```

---

## 🧪 Test Scenarios

### Happy Path
```
1. User books package ✅
2. Payment succeeds ✅
3. Status → Confirmed ✅
4. Invoice generated ✅
5. User views invoice ✅
```

### Payment Failure
```
1. User books package ✅
2. Payment fails ❌
3. Status → Pending ⚠️
4. User can retry payment ✅
```

### Pending Payment
```
1. User books package ✅
2. Closes payment modal ❌
3. Status → Pending ⚠️
4. "Pay Now" button visible ✅
5. User clicks "Pay Now" ✅
6. Payment succeeds ✅
7. Status → Confirmed ✅
```

---

## 🐛 Debugging

### Check Payment Flow
```javascript
// Frontend console
console.log('Order Data:', orderData);
console.log('Payment Response:', response);

// Backend logs
console.log('Payment verified:', razorpay_payment_id);
console.log('Invoice generated:', invoice._id);
```

### Check Database
```javascript
// MongoDB
db.packagebookings.find({ user: userId })
db.invoices.find({ user: userId })
db.payments.find({ user: userId })
```

### Common Issues
```
Issue: Payment modal not opening
Fix: Check Razorpay script loaded

Issue: Invoice not generated
Fix: Check backend logs for errors

Issue: Status not updating
Fix: Verify packageBookingId passed correctly
```

---

## 📱 Navigation Routes

### User Routes
```
/packages                  → Browse packages
/user/package-bookings     → My package bookings
/user/invoices             → My invoices
/user/service              → Browse services
/user/profile              → Dashboard
```

### Service Provider Routes
```
/service/serviceall        → My services
/service/invoices          → My invoices
/Service/profile           → Dashboard
```

### Admin Routes
```
/admin/packages            → Manage packages
/admin/profile             → Dashboard
```

---

## 🎯 Key Features

### ✅ Implemented
- Package booking with payment
- Automatic invoice generation
- Payment status tracking
- Booking status management
- PDF invoice download
- Simplified navbar
- Mobile responsive

### 🔮 Future Enhancements
- Email invoice notifications
- SMS booking confirmations
- Booking cancellation
- Refund processing
- Discount codes
- Package subscriptions

---

## 📞 Quick Commands

### Start Backend
```bash
cd backend
npm start
```

### Start Frontend
```bash
cd frontend/clsp
npm start
```

### Check Logs
```bash
# Backend
tail -f backend/logs/app.log

# Frontend
# Check browser console
```

### Test Payment
```
Card: 4111 1111 1111 1111
CVV: 123
Expiry: 12/25
OTP: 123456
```

---

## ✨ Success Indicators

```
✅ Package booking creates record
✅ Payment modal opens
✅ Payment verification succeeds
✅ Booking status → Confirmed
✅ Invoice auto-generated
✅ Invoice visible in list
✅ PDF download works
✅ Navbar is clean
```

---

## 📚 File Locations

### Backend
```
backend/
├── PaymentController/Payment.js       (Modified)
├── models/PackageBooking.js           (Modified)
├── invoiceController/Invoice.js       (Existing)
└── routers/
    ├── PackageRoute.js                (Existing)
    ├── PaymentRoute.js                (Existing)
    └── InvoiceRoute.js                (Existing)
```

### Frontend
```
frontend/clsp/src/
├── Components/
│   ├── packages/
│   │   ├── PackageList.jsx            (Modified)
│   │   └── MyPackageBookings.jsx      (Modified)
│   └── invoice/
│       └── InvoiceList.jsx            (Existing)
├── Services/operation/
│   └── PAymentauthcall.js             (Modified)
├── Pages/
│   └── NavbarProfile.js               (Modified)
└── index.js                           (Modified)
```

---

## 🎓 Learning Resources

- **Razorpay Integration:** https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
- **Invoice Best Practices:** https://www.freshbooks.com/hub/invoicing/invoice-best-practices
- **React Hooks:** https://react.dev/reference/react

---

**Last Updated:** April 21, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
