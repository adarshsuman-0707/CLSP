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
import UserSupport from './UserSupport';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';
import DashboardPage from './LandingDash';
import ShortcutsMenuItem from './ShortcutsMenuItem';
import PaymentHistory from './PaymentHistory';
import ServiceManPaymentHistory from '../Profile/ServicePages/ServiceManPaymentHistory.js';
import NearbyVendors from '../Components/vendor/NearbyVendors.jsx';
import VendorLocationSetup from '../Components/vendor/VendorLocationSetup.jsx';
import PackageList from '../Components/packages/PackageList.jsx';
import MyPackageBookings from '../Components/packages/MyPackageBookings.jsx';
import AdminPackageManager from '../Components/packages/AdminPackageManager.jsx';
import InvoiceList from '../Components/invoice/InvoiceList.jsx';
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

// ── Custom Sidebar Item ──────────────────────────────────────────────────────
const SidebarItem = ({ icon, label, section, active, onClick, badge }) => (
  <button
    onClick={() => onClick(section)}
    className={`dash-sidebar-item ${active === section ? 'active' : ''}`}
  >
    <i className={`fas fa-${icon}`} />
    <span>{label}</span>
    {badge > 0 && <span className="dash-badge">{badge}</span>}
  </button>
);

function Dashboard() {
  const role = localStorage.getItem("role");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 992);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem("activeSection") || "";
  });

  const [unreadSupportCount, setUnreadSupportCount] = useState(0);

  useEffect(() => {
    const handleSectionChange = (event) => {
      const newSection = event.detail?.section || localStorage.getItem("activeSection");
      if (newSection && newSection !== activeSection) {
        setActiveSection(newSection);
      }
    };
    window.addEventListener("dashboardSectionChange", handleSectionChange);
    const storedSection = localStorage.getItem("activeSection");
    if (storedSection && storedSection !== activeSection) {
      setActiveSection(storedSection);
    }
    return () => window.removeEventListener("dashboardSectionChange", handleSectionChange);
  }, [activeSection]);

  useEffect(() => {
    if (role === "admin") {
      const token = localStorage.getItem("token");
      getSupportMessages({ countOnly: true }, token)
        .then((res) => setUnreadSupportCount(res?.unreadCount ?? 0))
        .catch(() => {});
    }
  }, [role]);

  const handleSetActiveSection = (section) => {
    setActiveSection(section);
    localStorage.setItem("activeSection", section);
    if (isMobile) setSidebarOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && !e.altKey && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'p': e.preventDefault(); handleSetActiveSection("account"); break;
          case 'b': e.preventDefault(); handleSetActiveSection(role === 'user' ? "services" : "serviceRequests"); break;
          case 's': e.preventDefault(); handleSetActiveSection("savedService"); break;
          case 'w': e.preventDefault(); handleSetActiveSection("reviews"); break;
          case 'i': e.preventDefault(); handleSetActiveSection("notifications"); break;
          case 'y': e.preventDefault(); handleSetActiveSection("payment"); break;
          case 'x': e.preventDefault(); handleSetActiveSection(role === "user" ? "paymentHistory" : "payment"); break;
          case 'k': e.preventDefault(); handleSetActiveSection("ShortCuts"); break;
          default: break;
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [role]);

  // ── Section renderers ──────────────────────────────────────────────────────
  const adminRenderSection = () => {
    switch (activeSection) {
      case 'account': return <AccountSettings />;
      case 'managePackages': return <AdminPackageManager />;
      case 'notifications': return <Notification />;
      case 'invoices': return <InvoiceList />;
      case 'ShortCuts': return <ShortcutsMenuItem />;
      case 'userManagement': return <UserManagement />;
      case 'vendorManagement': return <VendorManagement />;
      case 'bookingsOverview': return <BookingsOverview />;
      case 'revenueAnalytics': return <RevenueAnalytics />;
      case 'categoryManagement': return <CategoryManagement />;
      case 'reviewsModeration': return <ReviewsModeration />;
      case 'paymentManagement': return <PaymentManagement />;
      case 'reportsExport': return <ReportsExport />;
      case 'supportMessages': return <SupportMessages />;
      case 'systemSettings': return <SystemSettings />;
      default: return <DashboardPage />;
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'account': return <AccountSettings />;
      case 'serviceRequests': return <ServiceList />;
      case 'savedService': return <AddService />;
      case 'reviews': return <Reviews />;
      case 'notifications': return <Notification />;
      case 'ShortCuts': return <ShortcutsMenuItem />;
      case 'payment': return <ServiceManPaymentHistory />;
      case 'locationSetup': return <VendorLocationSetup />;
      case 'invoices': return <InvoiceList />;
      case 'support': return <UserSupport />;
      default: return <DashboardPage />;
    }
  };

  const userRenderSection = () => {
    switch (activeSection) {
      case 'account': return <AccountSettings />;
      case 'services': return <BookService />;
      case 'savedService': return <SavedService />;
      case 'reviews': return <ReviewService />;
      case 'notifications': return <Notification />;
      case 'ShortCuts': return <ShortcutsMenuItem />;
      case 'payment': return <Payment />;
      case 'paymentHistory': return <PaymentHistory />;
      case 'nearbyVendors': return <NearbyVendors />;
      case 'packages': return <PackageList />;
      case 'myPackageBookings': return <MyPackageBookings onNavigate={handleSetActiveSection} />;
      case 'invoices': return <InvoiceList />;
      case 'support': return <UserSupport />;
      default: return <DashboardPage />;
    }
  };

  // ── Sidebar menu definitions ───────────────────────────────────────────────
  const userMenu = [
    { icon: 'user', label: 'Profile', section: 'account' },
    { icon: 'tools', label: 'Services', section: 'services' },
    { icon: 'map-marker-alt', label: 'Nearby Vendors', section: 'nearbyVendors' },
    { icon: 'box-open', label: 'Packages', section: 'packages' },
    { icon: 'clipboard-list', label: 'My Pkg Bookings', section: 'myPackageBookings' },
    { icon: 'heart', label: 'Saved Service', section: 'savedService' },
    { icon: 'star', label: 'Reviews & Rating', section: 'reviews' },
    { icon: 'bell', label: 'Notifications', section: 'notifications' },
    { icon: 'headset', label: 'Support', section: 'support' },
    { icon: 'credit-card', label: 'Payment', section: 'payment' },
    { icon: 'history', label: 'Payment History', section: 'paymentHistory' },
    { icon: 'file-invoice', label: 'My Invoices', section: 'invoices' },
    { icon: 'keyboard', label: 'Shortcuts', section: 'ShortCuts' },
  ];

  const serviceMenu = [
    { icon: 'user', label: 'Profile', section: 'account' },
    { icon: 'plus', label: 'Add Service', section: 'savedService' },
    { icon: 'table', label: 'Booking Requests', section: 'serviceRequests' },
    { icon: 'map-marker-alt', label: 'My Location', section: 'locationSetup' },
    { icon: 'star', label: 'Reviews & Rating', section: 'reviews' },
    { icon: 'bell', label: 'Notifications', section: 'notifications' },
    { icon: 'headset', label: 'Support', section: 'support' },
    { icon: 'history', label: 'Pay History', section: 'payment' },
    { icon: 'file-invoice', label: 'Invoices', section: 'invoices' },
    { icon: 'keyboard', label: 'Shortcuts', section: 'ShortCuts' },
  ];

  const adminMenu = [
    { icon: 'user', label: 'Profile', section: 'account' },
    { icon: 'box-open', label: 'Manage Packages', section: 'managePackages' },
    { icon: 'bell', label: 'Notifications', section: 'notifications' },
    { icon: 'file-invoice', label: 'Invoices', section: 'invoices' },
    { icon: 'users', label: 'Users', section: 'userManagement' },
    { icon: 'store', label: 'Vendors', section: 'vendorManagement' },
    { icon: 'calendar', label: 'Bookings', section: 'bookingsOverview' },
    { icon: 'chart-bar', label: 'Analytics', section: 'revenueAnalytics' },
    { icon: 'tags', label: 'Categories', section: 'categoryManagement' },
    { icon: 'star', label: 'Reviews', section: 'reviewsModeration' },
    { icon: 'credit-card', label: 'Payments', section: 'paymentManagement' },
    { icon: 'file-export', label: 'Reports', section: 'reportsExport' },
    { icon: 'envelope', label: 'Support', section: 'supportMessages', badge: unreadSupportCount },
    { icon: 'cog', label: 'Settings', section: 'systemSettings' },
    { icon: 'keyboard', label: 'Shortcuts', section: 'ShortCuts' },
  ];

  const menuItems = role === 'user' ? userMenu : role === 'admin' ? adminMenu : serviceMenu;

  return (
    <>
      <Navbar onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1020,
          }}
        />
      )}

      <div className="dash-layout">
        {/* Sidebar */}
        <aside
          className="dash-sidebar"
          style={{
            transform: isMobile
              ? sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
              : 'translateX(0)',
            position: isMobile ? 'fixed' : 'sticky',
            top: isMobile ? '56px' : '56px',
            zIndex: isMobile ? 1030 : 1,
          }}
        >
          <div className="dash-sidebar-header">
            <i className="fas fa-tachometer-alt" />
            <span>Dashboard</span>
          </div>

          <nav className="dash-sidebar-nav">
            {role && (
              <span className={`dash-role-badge ${role}`}>
                {role.toUpperCase()}
              </span>
            )}
            {menuItems.map((item) => (
              <SidebarItem
                key={item.section}
                icon={item.icon}
                label={item.label}
                section={item.section}
                active={activeSection}
                onClick={handleSetActiveSection}
                badge={item.badge}
              />
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="dash-main">
          {role === 'user'
            ? userRenderSection()
            : role === 'admin'
            ? adminRenderSection()
            : renderSection()}
        </main>
      </div>

      {role !== 'admin' && <Footer />}
    </>
  );
}

export default Dashboard;
