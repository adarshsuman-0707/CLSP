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
import ServiceManPaymentHistory from '../Profile/ServicePages/ServiceManPaymentHistory.js'

function Dashboard() {
  const role = localStorage.getItem("role");

  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem("activeSection") || "";
  });

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
        case 'v': // Reviews & Rating
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
            {role === "user" ? (
              <>
                <CDBSidebarMenu>
                  <div onClick={() => handleSetActiveSection("account")}>
                    <CDBSidebarMenuItem icon="user">Profile</CDBSidebarMenuItem>
                  </div>
                  <div onClick={() => handleSetActiveSection("services")}>
                    <CDBSidebarMenuItem icon="tools">Service Available</CDBSidebarMenuItem>
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
                    <CDBSidebarMenuItem icon="history">PaymentHistory</CDBSidebarMenuItem>
                  </div>
                    <div onClick={() => handleSetActiveSection("ShortCuts")}>
                    <CDBSidebarMenuItem icon="info">Shortcuts</CDBSidebarMenuItem>
                  </div>
                  
                </CDBSidebarMenu>

               
              </>
            ) : (
              <>
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
                  <div onClick={() => handleSetActiveSection("reviews")}>
                    <CDBSidebarMenuItem icon="star">Reviews & Rating</CDBSidebarMenuItem>
                  </div>
                  <div onClick={() => handleSetActiveSection("notifications")}>
                    <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
                  </div>
                    <div onClick={() => handleSetActiveSection("payment")}>
                    <CDBSidebarMenuItem icon="history">Pay History</CDBSidebarMenuItem>
                  </div>
                   <div onClick={() => handleSetActiveSection("ShortCuts")}>
                    <CDBSidebarMenuItem icon="info">Shortcuts</CDBSidebarMenuItem>
                  </div>
                </CDBSidebarMenu>

                {/* Shortcuts */}
             
              </>
            )}
          </CDBSidebarContent>
        </CDBSidebar>

        <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {role === 'user' ? userRenderSection() : renderSection()}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Dashboard;
