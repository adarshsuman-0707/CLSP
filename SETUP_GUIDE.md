# 🚀 Quick Setup Guide - Invoice & Package Integration

## Prerequisites
- Node.js (v14 or higher)
- MongoDB running
- Razorpay account (for payment testing)

---

## 📦 Installation Steps

### 1. Backend Setup

```bash
cd backend

# Install dependencies (if not already installed)
npm install

# Verify pdfkit is installed (required for invoice PDF generation)
npm list pdfkit
# Should show: pdfkit@0.18.0
```

### 2. Environment Configuration

Create/update `backend/.env` with these variables:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret

# Razorpay (Get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Company Details (for invoices)
COMPANY_NAME=CLSP Services Pvt. Ltd.
COMPANY_ADDRESS=123 Main Street, City, State - 123456
COMPANY_GSTIN=22AAAAA0000A1Z5
COMPANY_EMAIL=info@clspservices.com
COMPANY_PHONE=+91-9876543210
GST_PERCENTAGE=18

# Email (for notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server
PORT=5000
```

### 3. Frontend Setup

```bash
cd frontend/clsp

# Install dependencies (if not already installed)
npm install
```

### 4. Verify Razorpay Script

Check `frontend/clsp/public/index.html` contains:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

If not present, add it before the closing `</body>` tag.

---

## 🏃 Running the Application

### Start Backend
```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
```

Backend should start on: `http://localhost:5000`

### Start Frontend
```bash
cd frontend/clsp
npm start
```

Frontend should start on: `http://localhost:3000`

---

## 🧪 Testing the Integration

### Test 1: Package Booking with Payment

1. **Login as User**
   - Navigate to: `http://localhost:3000/login`
   - Login with user credentials

2. **Browse Packages**
   - Go to: `http://localhost:3000/packages`
   - Or click "📦 Packages" in navbar

3. **Book a Package**
   - Click "📦 Book This Package"
   - Select a future date/time
   - Click "Proceed to Payment"

4. **Complete Payment**
   - Razorpay modal should open
   - Use test card: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Click "Pay"

5. **Verify Success**
   - Should see success message
   - Redirected to invoices page
   - Invoice should be visible

### Test 2: View Package Bookings

1. **Navigate to Dashboard**
   - Click "📊 Dashboard" in navbar

2. **View Package Bookings**
   - In sidebar, click "My Pkg Bookings"
   - Should see your booking with:
     - Status: "Confirmed" (green badge)
     - Payment Status: "Paid" (green badge)
     - "🧾 View Invoice" button

### Test 3: Pending Payment Flow

1. **Book Another Package**
   - Go to packages page
   - Book a package
   - **Close the payment modal** (don't pay)

2. **Check Booking Status**
   - Go to "My Pkg Bookings"
   - Should see:
     - Status: "Pending" (yellow badge)
     - Payment Status: "Pending" (red badge)
     - "💳 Pay Now" button

3. **Complete Payment**
   - Click "💳 Pay Now"
   - Complete payment
   - Status should update automatically

### Test 4: Invoice Generation

1. **View Invoices**
   - Click "🧾 Invoices" in navbar
   - Should see all invoices (service + package)

2. **Check Invoice Details**
   - Click "▼ Details" to expand
   - Verify:
     - Invoice number
     - Items list
     - GST calculation
     - Total amount

3. **Download PDF**
   - Click "⬇ PDF" button
   - Invoice PDF should download

---

## 🔍 Troubleshooting

### Issue: Payment modal not opening

**Check:**
1. Browser console for errors
2. Razorpay script loaded: `window.Razorpay` should be defined
3. Network tab for API call to `/api/payment/makePayment`

**Solution:**
```bash
# Add to public/index.html if missing:
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### Issue: Invoice not generated

**Check:**
1. Backend console logs for errors
2. MongoDB connection
3. Invoice controller logs

**Debug:**
```bash
# Check backend logs for:
"✅ Invoice generated for booking: [id]"
# or
"⚠️ Invoice generation failed: [error]"
```

### Issue: Package booking status not updating

**Check:**
1. Payment verification response
2. MongoDB for booking document
3. Backend logs

**Verify:**
```javascript
// In MongoDB, check PackageBooking document:
{
  paymentStatus: true,  // Should be true after payment
  status: "Confirmed"   // Should be "Confirmed"
}
```

### Issue: Navbar not showing correctly

**Check:**
1. User role in localStorage: `localStorage.getItem('role')`
2. Authentication status: `localStorage.getItem('isLogin')`

**Clear cache:**
```bash
# In browser console:
localStorage.clear()
# Then login again
```

---

## 🎯 Quick Test Checklist

- [ ] Backend server running
- [ ] Frontend server running
- [ ] MongoDB connected
- [ ] Razorpay keys configured
- [ ] User can login
- [ ] Packages page loads
- [ ] Can book a package
- [ ] Payment modal opens
- [ ] Payment completes successfully
- [ ] Invoice generated automatically
- [ ] Booking status shows "Confirmed"
- [ ] Payment status shows "Paid"
- [ ] Invoice visible in "My Invoices"
- [ ] Can download invoice PDF
- [ ] Navbar shows correct menu items
- [ ] Mobile navbar works

---

## 📞 Support

If you encounter any issues:

1. Check backend logs: `backend/` terminal
2. Check frontend console: Browser DevTools
3. Check MongoDB: Verify data is being saved
4. Check network requests: Browser Network tab

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ Package booking creates a booking record  
✅ Payment modal opens with correct amount  
✅ Payment verification succeeds  
✅ Booking status changes to "Confirmed"  
✅ Invoice is auto-generated  
✅ Invoice appears in "My Invoices"  
✅ PDF download works  
✅ Navbar is clean and functional  

---

## 🔐 Razorpay Test Credentials

For testing payments, use:

**Test Card Numbers:**
- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`

**CVV:** Any 3 digits  
**Expiry:** Any future date  
**OTP:** `123456` (for test mode)

---

## 📚 Next Steps

After successful testing:

1. **Production Setup:**
   - Replace test Razorpay keys with live keys
   - Update company details in .env
   - Configure production MongoDB
   - Set up proper email service

2. **Additional Features:**
   - Email notifications for invoices
   - SMS notifications for bookings
   - Admin dashboard for package management
   - Booking cancellation flow

3. **Security:**
   - Enable HTTPS
   - Add rate limiting
   - Implement CSRF protection
   - Add input validation

---

Happy Testing! 🚀
