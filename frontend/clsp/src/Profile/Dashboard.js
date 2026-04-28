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
import './Dashboard.css';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    // Close sidebar on mobile after selection
    if (window.innerWidth < 992) {
      setSidebarOpen(false);
    }
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
      <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="d-lg-none position-fixed w-100 h-100"
          style={{
            top: 0,
            left: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 998
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', paddingTop: '56px', maxWidth: '100vw' }}>
        {/* Sidebar with mobile responsive behavior */}
        <div
          className={`sidebar-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}
          style={{
            position: window.innerWidth < 992 ? 'fixed' : 'relative',
            left: window.innerWidth < 992 ? (sidebarOpen ? 0 : '-280px') : 0,
            top: window.innerWidth < 992 ? '56px' : 0,
            height: window.innerWidth < 992 ? 'calc(100vh - 56px)' : '100vh',
            width: '250px',
            minWidth: '250px',
            transition: 'left 0.3s ease',
            zIndex: 900,
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          <CDBSidebar textColor="#fff" backgroundColor="#333">
            <CDBSidebarHeader className="mt-3 p-3" prefix={<i className="fa fa-bars fa-large"></i>}>
              <span>Dashboard</span>
            </CDBSidebarHeader>

          <CDBSidebarContent className="sidebar-content">
            {role === "user" && (
              <CDBSidebarMenu>
                <div onClick={() => handleSetActiveSection("account")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="user">Profile</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("services")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="tools">Service Available</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("nearbyVendors")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="map-marker-alt">Nearby Vendors</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("packages")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="box-open">Service Packages</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("myPackageBookings")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="clipboard-list">My Pkg Bookings</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("savedService")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="heart">Saved Service</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("reviews")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="star">Reviews & Rating</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("notifications")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("payment")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="credit-card">Payment</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("paymentHistory")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="history">Payment History</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("invoices")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="file-invoice">My Invoices</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("ShortCuts")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="info">Shortcuts</CDBSidebarMenuItem>
                </div>
              </CDBSidebarMenu>
            )}

            {role === "service" && (
              <CDBSidebarMenu>
                <div onClick={() => handleSetActiveSection("account")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="user">Profile</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("savedService")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="plus">Add Service</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("serviceRequests")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="table">Booking Requests</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("locationSetup")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="map-marker-alt">My Location</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("reviews")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="star">Reviews & Rating</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("notifications")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("payment")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="history">Pay History</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("invoices")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="file-invoice">Invoices</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("ShortCuts")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="info">Shortcuts</CDBSidebarMenuItem>
                </div>
              </CDBSidebarMenu>
            )}

            {role === "admin" && (
              <CDBSidebarMenu>
                <div onClick={() => handleSetActiveSection("account")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="user">Profile</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("managePackages")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="box-open">Manage Packages</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("notifications")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("invoices")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="file-invoice">Invoices</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("userManagement")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="users">Users</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("vendorManagement")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="store">Vendors</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("bookingsOverview")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="calendar">Bookings</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("revenueAnalytics")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="chart-bar">Analytics</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("categoryManagement")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="tags">Categories</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("reviewsModeration")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="star">Reviews</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("paymentManagement")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="credit-card">Payments</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("reportsExport")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="file-export">Reports</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("supportMessages")} style={{ cursor: 'pointer', position: "relative" }}>
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
                <div onClick={() => handleSetActiveSection("systemSettings")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="cog">Settings</CDBSidebarMenuItem>
                </div>
                <div onClick={() => handleSetActiveSection("ShortCuts")} style={{ cursor: 'pointer' }}>
                  <CDBSidebarMenuItem icon="info">Shortcuts</CDBSidebarMenuItem>
                </div>
              </CDBSidebarMenu>
            )}
          </CDBSidebarContent>
        </CDBSidebar>
        </div>

        {/* Main content area */}
        <div style={{ 
          flex: 1, 
          padding: window.innerWidth < 768 ? "10px" : "20px", 
          overflowY: "auto",
          marginLeft: window.innerWidth >= 992 ? '0' : '0',
          width: window.innerWidth < 992 ? '100%' : 'auto'
        }}>
          {role === 'user'
            ? userRenderSection()
            : role === 'admin'
            ? adminRenderSection()
            : renderSection()}
        </div>
      </div>
      {/* Footer only for non-admin roles */}
      {role !== 'admin' && <Footer />}
      
      {/* Mobile responsive CSS */}
      <style jsx>{`
        @media (max-width: 991px) {
          .sidebar-wrapper {
            box-shadow: 2px 0 10px rgba(0,0,0,0.3);
          }
        }
      `}</style>
    </>
  );
}

export default Dashboard;
