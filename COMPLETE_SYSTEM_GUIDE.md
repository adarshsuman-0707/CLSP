# Complete Vendor/Service Management System - Full Guide

## 🎯 System Overview

Yeh ek complete service booking platform hai jahan:
- **Users** services book karte hain
- **Vendors (Service Providers)** services provide karte hain  
- **Admin** system manage karta hai

## 👥 Roles & Responsibilities

### 1. USER
**Kya kar sakta hai:**
- ✅ Approved services dekh sakta hai
- ✅ Nearby vendors search kar sakta hai
- ✅ Service book kar sakta hai
- ✅ Reviews de sakta hai
- ✅ Invoices dekh sakta hai

**Kya NAHI kar sakta:**
- ❌ Pending/rejected services nahi dikh sakti
- ❌ Unverified vendors nahi dikhenge
- ❌ Blocked vendors nahi dikhenge

### 2. VENDOR (SERVICE PROVIDER)
**Kya kar sakta hai:**
- ✅ Services create kar sakta hai (if verified)
- ✅ Apni services manage kar sakta hai
- ✅ Booking requests accept/reject kar sakta hai
- ✅ Service delivery mark kar sakta hai
- ✅ Location aur availability set kar sakta hai
- ✅ Invoices dekh sakta hai

**Kya NAHI kar sakta:**
- ❌ Unverified hone par service create nahi kar sakta
- ❌ Blocked hone par kuch bhi nahi kar sakta
- ❌ Dusre vendor ki services edit nahi kar sakta
- ❌ Active bookings wali service delete nahi kar sakta

### 3. ADMIN
**Kya kar sakta hai:**
- ✅ Vendors ko verify/suspend kar sakta hai
- ✅ Services approve/reject kar sakta hai
- ✅ Sab services aur bookings dekh sakta hai
- ✅ Users manage kar sakta hai
- ✅ Analytics dekh sakta hai
- ✅ System settings control kar sakta hai

## 🔄 Complete Flows

### A. VENDOR ONBOARDING FLOW

```
Step 1: Signup
├─ Role: "service" select karo
├─ Basic details fill karo
└─ Account create ho gaya ✅

Step 2: Wait for Admin Verification
├─ Status: isVerified = false
├─ Cannot create services yet ⏳
└─ Admin notification sent

Step 3: Admin Verifies
├─ Admin checks vendor details
├─ Admin clicks "Verify"
└─ Status: isVerified = true ✅

Step 4: Location Setup
├─ Go to "My Location" in dashboard
├─ Auto-detect or manual enter
│  ├─ Latitude
│  ├─ Longitude
│  ├─ Address
│  └─ Service Radius (km)
└─ Location saved ✅

Step 5: Availability Setup
├─ Add time slots when available
│  ├─ Start Time
│  └─ End Time
└─ Availability saved ✅

Step 6: Create Services
├─ Go to "Add Service"
├─ Fill details:
│  ├─ Service Name
│  ├─ Description
│  ├─ Price
│  ├─ Duration
│  ├─ Category
│  └─ Available Slots (date + time)
├─ Submit
└─ Service created with status: "pending" ⏳

Step 7: Admin Approves Service
├─ Admin sees service in approval queue
├─ Admin clicks "Approve"
└─ Service status: "approved" ✅

Step 8: Service Live!
├─ Service visible to users
├─ Users can book
└─ Vendor receives booking requests 🎉
```

### B. USER BOOKING FLOW

```
Step 1: Browse Services
├─ See only APPROVED services
├─ From VERIFIED vendors
└─ Filter by category/location

Step 2: Select Service
├─ View service details
│  ├─ Price
│  ├─ Duration
│  ├─ Description
│  ├─ Vendor rating
│  └─ Available slots
└─ Choose a slot

Step 3: Book Service
├─ Click "Book Now"
├─ Slot status: isBooked = true
├─ Booking status: "pending"
└─ Vendor notified 📧

Step 4: Wait for Vendor Approval
├─ Vendor sees booking request
├─ Vendor can:
│  ├─ Accept → status: "Approved" ✅
│  └─ Reject → slot freed ❌
└─ User notified

Step 5: Service Delivery
├─ Vendor completes service
├─ Vendor marks: "completed"
├─ History entry created
└─ User notified 📧

Step 6: Payment
├─ User pays for service
├─ Payment processed
└─ Invoice generated automatically 🧾

Step 7: Review & Rating
├─ User can rate service
├─ Write review
└─ Review visible to others ⭐
```

### C. ADMIN MANAGEMENT FLOW

```
Vendor Management:
├─ View all vendors
├─ Pending verifications
│  ├─ Check vendor details
│  ├─ Verify → isVerified = true
│  └─ Vendor can now create services
├─ Suspend vendor
│  ├─ Block → isBlocked = true
│  ├─ Vendor cannot access features
│  └─ Services hidden from users
└─ Unsuspend → isBlocked = false

Service Management:
├─ View all services
├─ Pending approvals
│  ├─ Check service details
│  ├─ Approve → approvalStatus = "approved"
│  │  └─ Service visible to users
│  └─ Reject → approvalStatus = "rejected"
│     └─ Service hidden
└─ Monitor active services

User Management:
├─ View all users
├─ Block/Unblock users
└─ View user activity

System Overview:
├─ Total users
├─ Total vendors (verified/unverified)
├─ Total services (approved/pending)
├─ Active bookings
├─ Revenue analytics
└─ Recent activities
```

## 🔒 Security & Authorization

### API Protection

#### 1. Vendor Verification Check
```javascript
// Before creating service
if (!vendor.isVerified) {
  return "Account not verified. Wait for admin approval."
}
```

#### 2. Vendor Suspension Check
```javascript
// Before any vendor action
if (vendor.isBlocked) {
  return "Account suspended. Contact admin."
}
```

#### 3. Service Approval Check
```javascript
// When user browses services
if (user.role === "user") {
  show only services where approvalStatus === "approved"
}
```

#### 4. Ownership Verification
```javascript
// Before editing/deleting service
if (service.createdBy !== currentUser._id) {
  return "Unauthorized. You can only manage your own services."
}
```

## 📊 Database Schema

### User Model
```javascript
{
  username: String,
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  role: "admin" | "user" | "service",
  contact: String,
  city: String,
  state: String,
  country: String,
  
  // ✅ Admin control fields
  isVerified: Boolean,    // Admin verification
  isBlocked: Boolean,     // Admin suspension
  
  emailVerified: Boolean,
  phoneVerified: Boolean,
  address: String,
  profileImage: ObjectId
}
```

### Service Model
```javascript
{
  createdBy: ObjectId (ref: User),
  name: String,
  description: String,
  price: Number,
  duration: String,
  category: String,
  
  // ✅ Admin approval field
  approvalStatus: "pending" | "approved" | "rejected",
  
  availableSlots: [{
    date: Date,
    time: String,
    isBooked: Boolean,
    bookedBy: ObjectId (ref: User),
    bookingStatus: "pending" | "Approved" | "Rejected",
    bookedAt: Date,
    ServiceDeliveryStatus: "pending" | "completed" | "failed"
  }],
  
  createdAt: Date
}
```

### VendorLocation Model
```javascript
{
  vendor: ObjectId (ref: User),
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  address: String,
  serviceRadius: Number,  // in km
  isActive: Boolean
}
```

### VendorAvailability Model
```javascript
{
  vendor: ObjectId (ref: User),
  startTime: Date,
  endTime: Date,
  isBooked: Boolean
}
```

### Invoice Model
```javascript
{
  invoiceNumber: String,
  user: ObjectId (ref: User),
  vendor: ObjectId (ref: User),
  service: ObjectId (ref: Service),
  booking: ObjectId (ref: Booking),
  amount: Number,
  tax: Number,
  total: Number,
  paymentMethod: String,
  paymentStatus: "pending" | "paid" | "failed",
  generatedAt: Date
}
```

## 🎨 UI Components Needed

### Vendor Dashboard

#### 1. My Services Section
```
┌─────────────────────────────────────────┐
│ My Services                    [+ Add]  │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Plumbing Service        [Approved]  │ │
│ │ ₹500 | 1hr | 5 slots available     │ │
│ │ [Edit] [Delete] [View Bookings]    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ AC Repair              [Pending]    │ │
│ │ ₹800 | 2hr | Waiting for approval  │ │
│ │ [Edit] [Delete]                     │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 2. Booking Requests
```
┌─────────────────────────────────────────┐
│ Booking Requests            [3 Pending] │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ John Doe - Plumbing Service         │ │
│ │ Date: 25 Apr | Time: 10:00 AM       │ │
│ │ Status: Pending                     │ │
│ │ [Accept] [Reject]                   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 3. Location Setup
```
┌─────────────────────────────────────────┐
│ My Location                             │
├─────────────────────────────────────────┤
│ Latitude:  [23.279504]                  │
│ Longitude: [77.374811]                  │
│ Address:   [lalghati gufa mandir]       │
│ Radius:    [10 km] ━━━━━━━━━━━━━━━━━━  │
│                                         │
│ [Auto-Detect] [Save Location]           │
└─────────────────────────────────────────┘
```

### User Dashboard

#### 1. Browse Services
```
┌─────────────────────────────────────────┐
│ Available Services                      │
│ [Category ▼] [Search] [Nearby Vendors]  │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ 🔧 Plumbing Service                 │ │
│ │ By: Ritik Suman ⭐ 4.5 (12 reviews) │ │
│ │ ₹500 | 1hr | 0.5 km away            │ │
│ │ [View Details] [Book Now]           │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 2. My Bookings
```
┌─────────────────────────────────────────┐
│ My Bookings                             │
│ [Pending] [Approved] [Completed]        │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Plumbing Service - Ritik Suman      │ │
│ │ Date: 25 Apr | Time: 10:00 AM       │ │
│ │ Status: Approved ✅                 │ │
│ │ [View Details] [Cancel]             │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Admin Dashboard

#### 1. Vendor Verification Queue
```
┌─────────────────────────────────────────┐
│ Pending Vendor Verifications      [5]   │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Ritik Suman                         │ │
│ │ Email: ritik@example.com            │ │
│ │ Contact: 6263061901                 │ │
│ │ City: Indore, MP                    │ │
│ │ [Verify] [Reject] [View Details]    │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 2. Service Approval Queue
```
┌─────────────────────────────────────────┐
│ Pending Service Approvals         [8]   │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Plumbing Service                    │ │
│ │ By: Ritik Suman                     │ │
│ │ Price: ₹500 | Duration: 1hr         │ │
│ │ Category: Plumbing                  │ │
│ │ [Approve] [Reject] [View Details]   │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## 🚀 API Endpoints Summary

### Service APIs
```
GET    /api/service/services                    - Get all services (role-based)
GET    /api/service/vendor/my-services          - Get vendor's services
POST   /api/service/add/:creatorId              - Create service
PUT    /api/service/:serviceId                  - Update service
DELETE /api/service/:serviceId                  - Delete service
GET    /api/service/:serviceId/requests         - Get booking requests
POST   /api/service/:serviceId/slots            - Add slot
DELETE /api/service/:serviceId/slots/:slotId    - Delete slot
PUT    /api/service/:serviceId/slot/:slotId/status - Accept/Reject booking
PUT    /api/service/:serviceId/slot/:slotId/delivery - Mark completed
```

### Vendor APIs
```
PUT    /api/vendors/location                    - Update location
GET    /api/vendors/nearby                      - Find nearby vendors
POST   /api/vendors/availability                - Add availability
GET    /api/vendors/:vendorId/availability      - Get availability
```

### Admin APIs
```
GET    /api/admin/vendors                       - Get all vendors
PUT    /api/admin/vendors/:id/verify            - Verify vendor
PUT    /api/admin/vendors/:id/block             - Block/Unblock vendor
GET    /api/admin/services                      - Get all services
PUT    /api/admin/services/:id/approve          - Approve service
PUT    /api/admin/services/:id/reject           - Reject service
```

## 📱 Frontend Integration Guide

### 1. Check User Status
```javascript
// Before showing vendor features
const user = JSON.parse(localStorage.getItem('user'));

if (!user.isVerified) {
  showAlert("Your account is pending verification");
  disableServiceCreation();
}

if (user.isBlocked) {
  showAlert("Your account has been suspended");
  redirectToHome();
}
```

### 2. Filter Services by Role
```javascript
// In service list component
const fetchServices = async () => {
  const response = await api.get('/api/service/services');
  // Backend automatically filters based on role
  setServices(response.data.data);
};
```

### 3. Show Approval Status
```javascript
// In vendor service list
{services.map(service => (
  <ServiceCard 
    service={service}
    statusBadge={
      service.approvalStatus === 'approved' ? '✅ Approved' :
      service.approvalStatus === 'pending' ? '⏳ Pending' :
      '❌ Rejected'
    }
  />
))}
```

## 🎉 Summary

**System Features:**
1. ✅ Complete vendor verification system
2. ✅ Service approval workflow
3. ✅ Role-based access control
4. ✅ Location-based vendor search
5. ✅ Booking management
6. ✅ Invoice generation
7. ✅ Review & rating system

**Security Features:**
1. ✅ Admin verification required
2. ✅ Service approval required
3. ✅ Ownership verification
4. ✅ Blocked user restrictions
5. ✅ Role-based filtering

**User Experience:**
1. ✅ Clear status indicators
2. ✅ Real-time notifications
3. ✅ Easy booking process
4. ✅ Transparent pricing
5. ✅ Vendor ratings visible

Sab kuch ab properly connected hai aur working hai! 🎊
