import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import "bootstrap/dist/css/bootstrap.min.css";
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './Pages/Signup.js'
import Login from './Pages/Login.js';
import ForgotPassword from './Pages/ForgotPassword.js';
import Home from './Pages/Home.js';
import PageNotFound from './PageNotFound.js';
import Unauthorized from './unauthorized.jsx';
import ProtectedRoute from './ProtectedRoute.js';
import Dashboard from './Profile/Dashboard.js';
import Service from './FacilityPages/service.js';
import ServicePage from './Components/serviceMan/servicePage.jsx';
import AddServicePage from './Components/serviceMan/AddservicePage.jsx';
import ServiceBookingRequests from './Components/serviceMan/ServiceBookingRequests.jsx';
import GlobalShortCut from './GlobalShortCut.jsx';
import SavedService from './Profile/SavedService.js';
import PublicRoute from './publicRouteWrapper.js';
import UpdateServicePopup from './Components/serviceMan/UpdateServicePopup.jsx';
// ── New feature pages ────────────────────────────────────────────────────────
import NearbyVendors from './Components/vendor/NearbyVendors.jsx';
import PackageList from './Components/packages/PackageList.jsx';
import MyPackageBookings from './Components/packages/MyPackageBookings.jsx';
import InvoiceList from './Components/invoice/InvoiceList.jsx';
import AdminPackageManager from './Components/packages/AdminPackageManager.jsx';
import AccountBlocked from './Pages/AccountBlocked.jsx';
import PendingApproval from './Pages/PendingApproval.jsx';

const container = document.getElementById('root');

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <BrowserRouter>
      <GlobalShortCut />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<PublicRoute element={<Signup />} />} />
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/forgot" element={<ForgotPassword />} />

        {/* Public package listing */}
        <Route path="/packages" element={<PackageList />} />

        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/user/profile" element={<Dashboard />} />
          <Route path="/user/service" element={<Service />} />
          <Route path="/user/savedservices" element={<SavedService />} />
          <Route path="/user/nearby" element={<NearbyVendors />} />
          <Route path="/user/invoices" element={<InvoiceList />} />
          <Route path="/user/package-bookings" element={<MyPackageBookings />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["service"]} />}>
          <Route path="/Service/profile" element={<Dashboard />} />
          <Route path="/service/serviceall" element={<ServicePage />} />
          <Route path="/service/serviceadd" element={<AddServicePage />} />
          <Route path="/service/UpdateService" element={<UpdateServicePopup />} />
          <Route path="/service/invoices" element={<InvoiceList />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/profile" element={<Dashboard />} />
          <Route path="/admin/packages" element={<AdminPackageManager />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/blocked" element={<AccountBlocked />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/service/bookRequest" element={<ServiceBookingRequests />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
