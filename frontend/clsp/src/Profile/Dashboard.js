import React, { useState, useEffect } from 'react';
import Payment from './Payment'
import AccountSettings from './AccountSetting';
import ServiceList from '../Components/serviceMan/ServiceBookingRequests';
import BookService from '../FacilityPages/service';
import Footer from '../Pages/Footer';
import Navbar from '../Pages/NavbarProfile';
import ReviewService from './ReviewService';
import Notification from './Notification';
import AddService from '../Components/serviceMan/AddservicePage';
import SavedService from './SavedService';
import Reviews from '../Profile/ServicePages/Reviews';
import 'bootstrap/dist/css/bootstrap.min.css';
import DashboardPage from './LandingDash';
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from 'cdbreact';
import ShortcutsMenuItem from './ShortcutsMenuItem';
import PaymentHistory from './PaymentHistory';
import ServiceManPaymentHistory from '../Profile/ServicePages/ServiceManPaymentHistory.js';
// ── New feature imports ──────────────────────────────────────────────────────
import NearbyVendors from '../Components/vendor/NearbyVendors.jsx';
import VendorLocationSetup from '../Components/vendor/VendorLocationSetup.jsx';
import PackageList from '../Components/packages/PackageList.jsx';
import MyPackageBookings from '../Components/packages/MyPackageBookings.jsx';
import AdminPackageManager from '../Components/packages/AdminPackageManager.jsx';
import InvoiceList from '../Components/invoice/InvoiceList.jsx';
// import VendorServicesManager from '../Components/serviceMan/VendorServicesManager.jsx'; // ✅ NEW
// ── Admin Panel imports ──────────────────────────────────────────────────────
import UserManagement from '../Components/admin/UserManagement.jsx';
import VendorManagement from '../Components/admin/VendorManagement.jsx';
import BookingsOverview from '../Components/admin/BookingsOverview.jsx';
import RevenueAnalytics from '../Components/admin/RevenueAnalytics.jsx';
import CategoryManagement from '../Components/admin/CategoryManagement.jsx';
import ReviewsModeration from '../Components/admin/ReviewsModeration.jsx';
import PaymentManagement from '../Components/admin/PaymentManagement.jsx';
import ReportsExport from '../Components/admin/ReportsExport.jsx';
import SupportMessages from '../Components/admin/SupportMessages.jsx';
import SystemSettings from '../Components/admin/SystemSettings.jsx';
import { getSupportMessages } from '../Services/operation/adminAuthCall.js';

function Dashboard() {
  const role = localStorage.getItem("role");

  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem("activeSection") || "";
  });

  const [unreadSupportCount, setUnreadSupportCount] = useState(0);

  // Listen for custom event from navbar navigation
  useEffect(() => {
    const handleSectionChange = (event) => {
      const newSection = event.detail?.section || localStorage.getItem("activeSection");
      if (newSection && newSection !== activeSection) {
        setActiveSection(newSection);
      }
    };

    // Listen for custom event
    window.addEventListener("dashboardSectionChange", handleSectionChange);

    // Also check localStorage on mount
    const storedSection = localStorage.getItem("activeSection");
    if (storedSection && storedSection !== activeSection) {
      setActiveSection(storedSection);
    }

    return () => {
      window.removeEventListener("dashboardSectionChange", handleSectionChange);
    };
  }, [activeSection]);

  useEffect(() => {
    if (role === "admin") {
      const token = localStorage.getItem("token");
      getSupportMessages({ countOnly: true }, token)
        .then((res) => {
          setUnreadSupportCount(res?.unreadCount ?? 0);
        })
        .catch(() => {
          // silently fail — badge just won't show
        });
    }
  }, [role]);

  const handleSetActiveSection = (section) => {
    setActiveSection(section);
    localStorage.setItem("activeSection", section);
  };

 useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.ctrlKey && !e.altKey && !e.shiftKey) { // Ctrl only, no conflicts
      switch (e.key.toLowerCase()) {
        case 'p': // Profile
          e.preventDefault();
          handleSetActiveSection("account");
          break;
        case 'b': // Book Service / Service Requests
          e.preventDefault();
          if (role === 'user') {
            handleSetActiveSection("services");
          } else {
            handleSetActiveSection("serviceRequests");
          }
          break;
        case 's': // Saved / Add Service
          e.preventDefault();
          handleSetActiveSection("savedService");
          break;
        case 'w': // Reviews & Rating
          e.preventDefault();
          handleSetActiveSection("reviews");
          break;
        case 'i': // Notifications
          e.preventDefault();
          handleSetActiveSection("notifications");
          break;
        case 'y': // Payment / Payment History
          e.preventDefault();
          handleSetActiveSection("payment");
          break;
        case 'x':
         if(role=="user"){
             e.preventDefault();
          handleSetActiveSection("paymentHistory");
         } 
         else{
            e.preventDefault();
          handleSetActiveSection("payment");
         }
         break;
        case 'k': // Shortcuts
          e.preventDefault();
          handleSetActiveSection("ShortCuts");
          break;
        default:
          break;
      }
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [role]);

  const adminRenderSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings />;
      case 'managePackages':
        return <AdminPackageManager />;
      case 'notifications':
        return <Notification />;
      case 'invoices':
        return <InvoiceList />;
      case 'ShortCuts':
        return <ShortcutsMenuItem />;
      // ── New admin sections ───────────────────────────────────────────────
      case 'userManagement':
        return <UserManagement />;
      case 'vendorManagement':
        return <VendorManagement />;
      case 'bookingsOverview':
        return <BookingsOverview />;
      case 'revenueAnalytics':
        return <RevenueAnalytics />;
      case 'categoryManagement':
        return <CategoryManagement />;
      case 'reviewsModeration':
        return <ReviewsModeration />;
      case 'paymentManagement':
        return <PaymentManagement />;
      case 'reportsExport':
        return <ReportsExport />;
      case 'supportMessages':
        return <SupportMessages />;
      case 'systemSettings':
        return <SystemSettings />;
      default:
        return <div className="text-center mt-5"><DashboardPage /></div>;
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings />;
      case 'serviceRequests':
        return <ServiceList />;
      case 'savedService':
        return <AddService />;
      case 'reviews':
        return <Reviews />;
      case 'notifications':
        return <Notification />;
      case 'ShortCuts':
        return <ShortcutsMenuItem/>;
      case 'payment':
        return <ServiceManPaymentHistory/>
      // ── New sections (service role) ──────────────────────────────────────
      case 'locationSetup':
        return <VendorLocationSetup />;
      case 'invoices':
        return <InvoiceList />;
      default:
        return <div className="text-center mt-5"><DashboardPage/></div>;
    }
  };

  const userRenderSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings />;
      case 'services':
        return <BookService />;
      case 'savedService':
        return <SavedService />;
      case 'reviews':
        return <ReviewService />;
      case 'notifications':
        return <Notification />;
      case 'ShortCuts':
        return <ShortcutsMenuItem/>
      case 'payment':
        return <Payment/>;
      case 'paymentHistory':
        return <PaymentHistory/>
      // ── New sections (user role) ─────────────────────────────────────────
      case 'nearbyVendors':
        return <NearbyVendors />;
      case 'packages':
        return <PackageList />;
      case 'myPackageBookings':
        return <MyPackageBookings onNavigate={handleSetActiveSection} />;
      case 'invoices':
        return <InvoiceList />;
      default:
        return <div className="text-center mt-5"><DashboardPage/></div>;
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ display: 'flex', height: '100vh', overflow: 'scroll initial' }}>
        <CDBSidebar textColor="#fff" backgroundColor="#333">
          <CDBSidebarHeader className="mt-5 p-3" prefix={<i className="fa fa-bars fa-large"></i>}>
            <span>Dashboard</span>
          </CDBSidebarHeader>

          <CDBSidebarContent className="sidebar-content">
            {role === "user" && (
              <CDBSidebarMenu>
                <div onClick={() => handleSetActiveSection("account")}>
                  <CDBSidebarMenuItem icon="user">Profile</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("services")}>
                  <CDBSidebarMenuItem icon="tools">Service Available</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("nearbyVendors")}>
                  <CDBSidebarMenuItem icon="map-marker-alt">Nearby Vendors</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("packages")}>
                  <CDBSidebarMenuItem icon="box-open">Service Packages</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("myPackageBookings")}>
                  <CDBSidebarMenuItem icon="clipboard-list">My Pkg Bookings</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("savedService")}>
                  <CDBSidebarMenuItem icon="heart">Saved Service</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("reviews")}>
                  <CDBSidebarMenuItem icon="star">Reviews & Rating</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("notifications")}>
                  <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("payment")}>
                  <CDBSidebarMenuItem icon="credit-card">Payment</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("paymentHistory")}>
                  <CDBSidebarMenuItem icon="history">Payment History</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("invoices")}>
                  <CDBSidebarMenuItem icon="file-invoice">My Invoices</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("ShortCuts")}>
                  <CDBSidebarMenuItem icon="info">Shortcuts</CDBSidebarMenuItem>
                </div>
              </CDBSidebarMenu>
            )}

            {role === "service" && (
              <CDBSidebarMenu>
                <div onClick={() => handleSetActiveSection("account")}>
                  <CDBSidebarMenuItem icon="user">Profile</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("savedService")}>
                  <CDBSidebarMenuItem icon="plus">Add Service</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("serviceRequests")}>
                  <CDBSidebarMenuItem icon="table">Booking Requests</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("locationSetup")}>
                  <CDBSidebarMenuItem icon="map-marker-alt">My Location</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("reviews")}>
                  <CDBSidebarMenuItem icon="star">Reviews & Rating</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("notifications")}>
                  <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("payment")}>
                  <CDBSidebarMenuItem icon="history">Pay History</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("invoices")}>
                  <CDBSidebarMenuItem icon="file-invoice">Invoices</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("ShortCuts")}>
                  <CDBSidebarMenuItem icon="info">Shortcuts</CDBSidebarMenuItem>
                </div>
              </CDBSidebarMenu>
            )}

            {role === "admin" && (
              <CDBSidebarMenu>
                <div onClick={() => handleSetActiveSection("account")}>
                  <CDBSidebarMenuItem icon="user">Profile</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("managePackages")}>
                  <CDBSidebarMenuItem icon="box-open">Manage Packages</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("notifications")}>
                  <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("invoices")}>
                  <CDBSidebarMenuItem icon="file-invoice">Invoices</CDBSidebarMenuItem>
                </div>
                {/* ── New admin sections ──────────────────────────────────── */}
                <div onClick={() => handleSetActiveSection("userManagement")}>
                  <CDBSidebarMenuItem icon="users">Users</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("vendorManagement")}>
                  <CDBSidebarMenuItem icon="store">Vendors</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("bookingsOverview")}>
                  <CDBSidebarMenuItem icon="calendar">Bookings</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("revenueAnalytics")}>
                  <CDBSidebarMenuItem icon="chart-bar">Analytics</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("categoryManagement")}>
                  <CDBSidebarMenuItem icon="tags">Categories</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("reviewsModeration")}>
                  <CDBSidebarMenuItem icon="star">Reviews</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("paymentManagement")}>
                  <CDBSidebarMenuItem icon="credit-card">Payments</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("reportsExport")}>
                  <CDBSidebarMenuItem icon="file-export">Reports</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("supportMessages")} style={{ position: "relative" }}>
                  <CDBSidebarMenuItem icon="envelope">
                    Support
                    {unreadSupportCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "6px",
                          right: "12px",
                          background: "#dc3545",
                          color: "#fff",
                          borderRadius: "50%",
                          fontSize: "11px",
                          fontWeight: "bold",
                          minWidth: "18px",
                          height: "18px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0 4px",
                        }}
                      >
                        {unreadSupportCount}
                      </span>
                    )}
                  </CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("systemSettings")}>
                  <CDBSidebarMenuItem icon="cog">Settings</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("ShortCuts")}>
                  <CDBSidebarMenuItem icon="info">Shortcuts</CDBSidebarMenuItem>
                </div>
              </CDBSidebarMenu>
            )}
          </CDBSidebarContent>
        </CDBSidebar>

        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {role === 'user'
            ? userRenderSection()
            : role === 'admin'
            ? adminRenderSection()
            : renderSection()}
        </div>
      </div>
      {/* Footer only for non-admin roles */}
      {role !== 'admin' && <Footer />}
    </>
  );
}

export default Dashboard;
