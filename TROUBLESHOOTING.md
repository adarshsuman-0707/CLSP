# 🔧 Troubleshooting Guide

## Common Issues & Solutions

---

## 🚫 Payment Issues

### Issue 1: Razorpay Modal Not Opening

**Symptoms:**
- Click "Proceed to Payment" but nothing happens
- Console error: "Razorpay is not defined"

**Diagnosis:**
```javascript
// Check in browser console:
console.log(window.Razorpay);
// Should return: function Razorpay() { ... }
// If undefined, script not loaded
```

**Solutions:**

1. **Check Razorpay Script in HTML**
   ```html
   <!-- frontend/clsp/public/index.html -->
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```

2. **Clear Browser Cache**
   ```
   Ctrl + Shift + Delete → Clear cached images and files
   ```

3. **Check Network Tab**
   - Open DevTools → Network
   - Look for `checkout.js` request
   - Should return 200 OK

4. **Verify Internet Connection**
   - Razorpay CDN requires internet access
   - Check if other external resources load

---

### Issue 2: Payment Verification Failed

**Symptoms:**
- Payment completes but shows "Payment verification failed"
- Backend returns 400 error

**Diagnosis:**
```bash
# Check backend logs:
❌ Verification Error: Invalid signature
```

**Solutions:**

1. **Verify Razorpay Keys**
   ```env
   # backend/.env
   RAZORPAY_KEY_ID=rzp_test_xxxxx  # Must match dashboard
   RAZORPAY_KEY_SECRET=xxxxx       # Must be correct
   ```

2. **Check Key Mismatch**
   ```javascript
   // Frontend uses: orderData.key_id
   // Backend uses: process.env.RAZORPAY_KEY_ID
   // These MUST match!
   ```

3. **Restart Backend Server**
   ```bash
   cd backend
   npm start
   ```

4. **Test with Razorpay Test Mode**
   - Use test keys from dashboard
   - Use test card: 4111 1111 1111 1111

---

### Issue 3: Payment Succeeds but Status Not Updated

**Symptoms:**
- Payment completes successfully
- Booking still shows "Pending"
- Payment status still "false"

**Diagnosis:**
```javascript
// Check backend logs:
console.log('packageBookingId:', packageBookingId);
// Should show valid MongoDB ObjectId
// If undefined, not being passed correctly
```

**Solutions:**

1. **Verify packageBookingId is Passed**
   ```javascript
   // frontend/clsp/src/Components/packages/PackageList.jsx
   const verifyResponse = await UserPaymentVerify({
     // ... other params
     packageBookingId: packageBookingId,  // ← Must be present
     // ...
   });
   ```

2. **Check Database Update**
   ```javascript
   // MongoDB
   db.packagebookings.findOne({ _id: ObjectId("...") })
   // Should show:
   // paymentStatus: true
   // status: "Confirmed"
   ```

3. **Check Backend Update Logic**
   ```javascript
   // backend/PaymentController/Payment.js
   if (packageBookingId) {
     const updatedBooking = await PackageBooking.findByIdAndUpdate(
       packageBookingId,
       { $set: { paymentStatus: true, status: 'Confirmed' } },
       { new: true }
     );
   }
   ```

---

## 📄 Invoice Issues

### Issue 4: Invoice Not Generated

**Symptoms:**
- Payment succeeds
- No invoice appears in "My Invoices"
- Backend logs show error

**Diagnosis:**
```bash
# Check backend logs:
⚠️ Invoice generation failed: [error message]
```

**Solutions:**

1. **Check Invoice Generation Call**
   ```javascript
   // backend/PaymentController/Payment.js
   try {
     const { generateInvoice } = require('../invoiceController/Invoice.js');
     if (packageBookingId) {
       await generateInvoice({ packageBookingId, userId });
     }
   } catch (invoiceError) {
     console.error("⚠️ Invoice generation failed:", invoiceError.message);
   }
   ```

2. **Verify Package Booking Exists**
   ```javascript
   // MongoDB
   db.packagebookings.findOne({ _id: ObjectId("...") })
     .populate('package')
     .populate('package.services')
   // All fields should be populated
   ```

3. **Check Company Details in .env**
   ```env
   COMPANY_NAME=CLSP Services Pvt. Ltd.
   COMPANY_ADDRESS=123 Main St
   COMPANY_GSTIN=22AAAAA0000A1Z5
   COMPANY_EMAIL=info@company.com
   COMPANY_PHONE=+91-9876543210
   GST_PERCENTAGE=18
   ```

4. **Manually Generate Invoice**
   ```bash
   # Test invoice generation:
   POST /api/invoice/generate
   Body: { packageBookingId: "..." }
   ```

---

### Issue 5: Invoice PDF Download Fails

**Symptoms:**
- Click "⬇ PDF" button
- Nothing downloads or error appears

**Diagnosis:**
```bash
# Check backend logs:
downloadInvoicePDF error: [error message]
```

**Solutions:**

1. **Verify PDFKit Installed**
   ```bash
   cd backend
   npm list pdfkit
   # Should show: pdfkit@0.18.0
   ```

2. **Install PDFKit if Missing**
   ```bash
   npm install pdfkit@0.18.0
   ```

3. **Check Response Type**
   ```javascript
   // frontend/clsp/src/Services/operation/invoiceAuthCall.js
   const res = await apiConnector.get(url, {
     headers: { Authorization: `Bearer ${token}` },
     responseType: "blob",  // ← Must be "blob"
   });
   ```

4. **Check Browser Console**
   - Look for CORS errors
   - Check if blob is created
   - Verify download link is clicked

---

## 🗄️ Database Issues

### Issue 6: MongoDB Connection Failed

**Symptoms:**
- Backend crashes on startup
- Error: "MongooseServerSelectionError"

**Solutions:**

1. **Check MongoDB is Running**
   ```bash
   # Windows:
   net start MongoDB
   
   # Linux/Mac:
   sudo systemctl start mongod
   ```

2. **Verify Connection String**
   ```env
   # backend/.env
   MONGO_URI=mongodb://localhost:27017/clsp
   # or
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/clsp
   ```

3. **Test Connection**
   ```bash
   # MongoDB Shell
   mongosh "mongodb://localhost:27017/clsp"
   ```

---

### Issue 7: PaymentStatus Field Not Found

**Symptoms:**
- Error: "paymentStatus is not defined"
- Old bookings don't have paymentStatus

**Solutions:**

1. **Update Existing Documents**
   ```javascript
   // MongoDB
   db.packagebookings.updateMany(
     { paymentStatus: { $exists: false } },
     { $set: { paymentStatus: false } }
   )
   ```

2. **Verify Schema Updated**
   ```javascript
   // backend/models/PackageBooking.js
   paymentStatus: {
     type: Boolean,
     default: false,
   }
   ```

---

## 🎨 Frontend Issues

### Issue 8: Navbar Not Showing Correctly

**Symptoms:**
- Navbar shows wrong menu items
- Role badge not displaying

**Diagnosis:**
```javascript
// Browser console:
console.log(localStorage.getItem('role'));
console.log(localStorage.getItem('isLogin'));
```

**Solutions:**

1. **Clear LocalStorage**
   ```javascript
   // Browser console:
   localStorage.clear();
   // Then login again
   ```

2. **Verify Role is Set on Login**
   ```javascript
   // After login:
   localStorage.setItem('role', user.role);
   localStorage.setItem('isLogin', 'true');
   ```

3. **Check Navbar Component**
   ```javascript
   // frontend/clsp/src/Pages/NavbarProfile.js
   const role = localStorage.getItem("role");
   // Should be: "user", "service", or "admin"
   ```

---

### Issue 9: Package Bookings Not Loading

**Symptoms:**
- "My Package Bookings" page shows loading spinner forever
- No bookings displayed

**Diagnosis:**
```javascript
// Browser console:
// Check Network tab for API call
GET /api/packages/bookings/my
// Check response
```

**Solutions:**

1. **Check Authentication**
   ```javascript
   // Verify token exists:
   console.log(localStorage.getItem('token'));
   ```

2. **Check API Endpoint**
   ```javascript
   // frontend/clsp/src/Services/api.js
   PACKAGE_MY_BOOKINGS: API_BASE_URL + "packages/bookings/my"
   ```

3. **Check Backend Route**
   ```javascript
   // backend/routers/PackageRoute.js
   route.get("/bookings/my", authMiddleware, getUserPackageBookings);
   ```

4. **Test API Directly**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:5000/api/packages/bookings/my
   ```

---

## 🔐 Authentication Issues

### Issue 10: Token Expired

**Symptoms:**
- API calls return 401 Unauthorized
- User logged out unexpectedly

**Solutions:**

1. **Check Token Expiry**
   ```javascript
   // Decode JWT token:
   const token = localStorage.getItem('token');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Expires:', new Date(payload.exp * 1000));
   ```

2. **Implement Token Refresh**
   ```javascript
   // Or simply re-login
   localStorage.clear();
   window.location.href = '/login';
   ```

---

## 🌐 Network Issues

### Issue 11: CORS Error

**Symptoms:**
- Console error: "CORS policy blocked"
- API calls fail from frontend

**Solutions:**

1. **Check Backend CORS Config**
   ```javascript
   // backend/index.js
   const cors = require('cors');
   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true
   }));
   ```

2. **Verify Frontend API URL**
   ```javascript
   // frontend/clsp/src/Services/api.js
   const API_BASE_URL = "http://localhost:5000/api/";
   ```

---

### Issue 12: API Not Responding

**Symptoms:**
- Network tab shows "pending" forever
- No response from backend

**Solutions:**

1. **Check Backend is Running**
   ```bash
   # Should see:
   Server running on port 5000
   MongoDB connected
   ```

2. **Check Port Conflicts**
   ```bash
   # Windows:
   netstat -ano | findstr :5000
   
   # Linux/Mac:
   lsof -i :5000
   ```

3. **Restart Backend**
   ```bash
   cd backend
   npm start
   ```

---

## 🧪 Testing Issues

### Issue 13: Test Payment Fails

**Symptoms:**
- Test card doesn't work
- Payment always fails

**Solutions:**

1. **Use Correct Test Cards**
   ```
   Success: 4111 1111 1111 1111
   Failure: 4000 0000 0000 0002
   CVV: Any 3 digits
   Expiry: Any future date
   ```

2. **Verify Test Mode**
   ```env
   # backend/.env
   RAZORPAY_KEY_ID=rzp_test_xxxxx  # Must start with "rzp_test_"
   ```

3. **Check Razorpay Dashboard**
   - Go to https://dashboard.razorpay.com/
   - Check "Test Mode" is enabled
   - View test payments

---

## 📊 Debugging Tools

### Backend Debugging

```javascript
// Add debug logs in PaymentController:
console.log('🔹 Payment verification started');
console.log('📦 Package Booking ID:', packageBookingId);
console.log('💰 Amount:', amount);
console.log('👤 User ID:', userId);

// After verification:
console.log('✅ Payment verified');
console.log('📄 Invoice generated:', invoice._id);
```

### Frontend Debugging

```javascript
// Add debug logs in PackageList:
console.log('📦 Booking created:', bookingRes.data);
console.log('💳 Payment order:', orderData);
console.log('✅ Payment verified:', verifyResponse);
```

### Database Debugging

```javascript
// MongoDB queries:
// Check booking
db.packagebookings.find({ user: ObjectId("...") }).pretty()

// Check payment
db.payments.find({ user: ObjectId("...") }).pretty()

// Check invoice
db.invoices.find({ user: ObjectId("...") }).pretty()
```

---

## 🆘 Emergency Fixes

### Quick Reset

```bash
# 1. Stop all servers
Ctrl + C (in both terminals)

# 2. Clear node_modules (if needed)
cd backend && rm -rf node_modules && npm install
cd frontend/clsp && rm -rf node_modules && npm install

# 3. Clear browser data
# In browser: Ctrl + Shift + Delete

# 4. Restart MongoDB
net start MongoDB  # Windows
sudo systemctl restart mongod  # Linux

# 5. Restart servers
cd backend && npm start
cd frontend/clsp && npm start
```

---

## 📞 Getting Help

### Information to Provide

When reporting issues, include:

1. **Error Message**
   - Full error from console/logs
   - Stack trace if available

2. **Environment**
   - Node version: `node --version`
   - npm version: `npm --version`
   - OS: Windows/Linux/Mac

3. **Steps to Reproduce**
   - What you did
   - What you expected
   - What actually happened

4. **Logs**
   - Backend console output
   - Browser console errors
   - Network tab requests

---

## ✅ Health Check Checklist

Run this checklist to verify everything is working:

- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 3000)
- [ ] MongoDB connected
- [ ] Can login successfully
- [ ] Packages page loads
- [ ] Can view package details
- [ ] Booking modal opens
- [ ] Payment modal opens
- [ ] Test payment succeeds
- [ ] Booking status updates
- [ ] Invoice generated
- [ ] Invoice visible in list
- [ ] PDF download works
- [ ] Navbar shows correct items

---

**Last Updated:** April 21, 2026  
**Version:** 1.0.0
