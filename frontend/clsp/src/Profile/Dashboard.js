// import React, { useState } from 'react';
// import { Container, Row, Col, Card, Button, Nav, Image } from 'react-bootstrap';
// import AccountSettings from './AccountSetting';
// import Navbar from '../Pages/NavbarProfile';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import {
//   CDBSidebar,
//   CDBSidebarContent,
//   CDBSidebarHeader,
//   CDBSidebarMenu,
//   CDBSidebarMenuItem,
// } from 'cdbreact';
// import { NavLink } from 'react-router-dom';
// import { FaUser, FaWallet, FaHistory, FaBell, FaEdit, FaPowerOff } from 'react-icons/fa';


// const role=localStorage.getItem("role")
// function Dashboard() {
//   const [activeSection, setActiveSection] = useState('account');

//   const renderSection = () => {
//     switch (activeSection) {
//       case 'account':
//         return <AccountSettings />;
//       case 'wallet':
//         return <h2>Wallet Section</h2>; // Replace with Wallet component
//       case 'purchaseHistory':
//         return <h2>Purchase History</h2>; // Replace with PurchaseHistory component
//       case 'notifications':
//         return <h2>Notifications</h2>; // Replace with Notifications component
//       default:
//         return <AccountSettings />;
//     }
//   };

//   return (
//     <>
//     <Navbar />
//       <div className = ' 'style={{ display: 'flex', height: '100vh',overflow: 'scroll initial' }}>
//       <CDBSidebar textColor="#fff" backgroundColor="#333" className=''>
//       <CDBSidebarHeader className='mt-5 p-3'  prefix={<i className="fa fa-bars fa-large"></i>}>
//   <span>Dashboard</span>
// </CDBSidebarHeader>


//         <CDBSidebarContent className="sidebar-content">
//         {role==="user"? ( <CDBSidebarMenu>
//             <NavLink exact to="/user/profile" activeClassName="activeClicked">
//               <CDBSidebarMenuItem icon="columns">Profile</CDBSidebarMenuItem>
//             </NavLink>
//             <NavLink exact to="/service/bookRequest" activeClassName="activeClicked">
//               <CDBSidebarMenuItem icon="table">Service Requests</CDBSidebarMenuItem>
//             </NavLink>
//             <NavLink exact to="/profile" activeClassName="activeClicked">
//               <CDBSidebarMenuItem icon="heart">saved service</CDBSidebarMenuItem>
//             </NavLink>
//             <NavLink exact to="/analytics" activeClassName="activeClicked">
//               <CDBSidebarMenuItem icon="star">Reviews & Rating</CDBSidebarMenuItem>
//             </NavLink>

//             <NavLink exact to="/hero404" target="_blank" activeClassName="activeClicked">
//               <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
//             </NavLink>
//           </CDBSidebarMenu>
// ):(<CDBSidebarMenu>
//             <NavLink exact to="/Facilator/profile" activeClassName="activeClicked">
//               <CDBSidebarMenuItem icon="columns">Profile</CDBSidebarMenuItem>
//             </NavLink>
//             <NavLink exact to="/service/bookRequest" activeClassName="activeClicked">
//               <CDBSidebarMenuItem icon="table">Service Requests</CDBSidebarMenuItem>
//             </NavLink>
//             <NavLink exact to="/profile" activeClassName="activeClicked">
//               <CDBSidebarMenuItem icon="heart">saved service</CDBSidebarMenuItem>
//             </NavLink>
//             <NavLink exact to="/analytics" activeClassName="activeClicked">
//               <CDBSidebarMenuItem icon="star">Reviews & Rating</CDBSidebarMenuItem>
//             </NavLink>

//             <NavLink exact to="/hero404" target="_blank" activeClassName="activeClicked">
//               <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
//             </NavLink>
//           </CDBSidebarMenu>
//         )}
//         </CDBSidebarContent>


//       </CDBSidebar> 

//       <AccountSettings />


//     </div>

//     </>
//   );
// }

// // export default Dashboard;
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import AccountSettings from './AccountSetting';
// import ServiceList from '../Components/serviceMan/ServiceBookingRequests';
// import BookService from '../FacilityPages/service';
// import Footer from '../Pages/Footer';
// import Navbar from '../Pages/NavbarProfile';
// import ReviewService from './ReviewService';
// import Notification from './Notification';
// import AddService from '../Components/serviceMan/AddservicePage'
// import 'bootstrap/dist/css/bootstrap.min.css';
// import {
//   CDBSidebar,
//   CDBSidebarContent,
//   CDBSidebarHeader,
//   CDBSidebarMenu,
//   CDBSidebarMenuItem,
// } from 'cdbreact';
// import SavedService from './SavedService';
// import Reviews from '../Profile/ServicePages/Reviews';


// function Dashboard() {
//   const [activeSection, setActiveSection] = useState('account');
//   const navigate = useNavigate();
//   const role = localStorage.getItem("role");
//   // yeh function decide karega kaunsa component dikhe
//   const renderSection = () => {
//     switch (activeSection) {
//       case 'account':
//         return <AccountSettings />;
//       case 'serviceRequests':
//         return <ServiceList />;
//       case 'savedService':
//         return <AddService/>
//       case 'reviews':
//         return <Reviews/>
//       case 'notifications':
//         return <Notification/>
//       default:
//         return <AccountSettings />;
//     }
//   };
//   const userrenderSection = () => {
//     switch (activeSection) {
//       case 'account':
//         return <AccountSettings />;
//       case 'serviceRequests':
//         return <BookService />;
//       case 'savedService':
//         return <SavedService/>
//       case 'reviews':
//         return <ReviewService/>;
//       case 'notifications':
//         return <Notification/>;
//       default:
//         return <AccountSettings />;
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div style={{ display: 'flex', height: '100vh', overflow: 'scroll initial' }}>
//         <CDBSidebar textColor="#fff" backgroundColor="#333">
//           <CDBSidebarHeader className="mt-5 p-3" prefix={<i className="fa fa-bars fa-large"></i>}>
//             <span>Dashboard</span>
//           </CDBSidebarHeader>

//           <CDBSidebarContent className="sidebar-content">
//             {role === "user" ? (
//               <CDBSidebarMenu>
//                 <div onClick={() => setActiveSection("account")}>
//                   <CDBSidebarMenuItem icon="columns">Profile</CDBSidebarMenuItem>
//                 </div>
//                 <div onClick={() => setActiveSection("serviceRequests")}>
//                   <CDBSidebarMenuItem icon="table">Service Requests</CDBSidebarMenuItem>
//                 </div>
//                 <div onClick={() => setActiveSection("savedService")}>
//                   <CDBSidebarMenuItem icon="heart">Saved Service</CDBSidebarMenuItem>
//                 </div>
//                 <div onClick={() => setActiveSection("reviews")}>
//                   <CDBSidebarMenuItem icon="star">Reviews & Rating</CDBSidebarMenuItem>
//                 </div>
//                 <div onClick={() => setActiveSection("notifications")}>
//                   <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
//                 </div>
//               </CDBSidebarMenu>
//             ) : (
//               <CDBSidebarMenu>
//                 <div onClick={() => setActiveSection("account")}>
//                   <CDBSidebarMenuItem icon="columns">Profile</CDBSidebarMenuItem>
//                 </div>
//                 <div onClick={() => setActiveSection("savedService")}>
//                   <CDBSidebarMenuItem icon="plus">Add Service</CDBSidebarMenuItem>
//                 </div>
//                 <div onClick={() => setActiveSection("serviceRequests")}>
//                   <CDBSidebarMenuItem icon="table">Service Requests</CDBSidebarMenuItem>
//                 </div>
//                 <div onClick={() => setActiveSection("reviews")}>
//                   <CDBSidebarMenuItem icon="star">Reviews & Rating</CDBSidebarMenuItem>
//                 </div>
//                 <div onClick={() => setActiveSection("notifications")}>
//                   <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
//                 </div>
//               </CDBSidebarMenu>
//             )}
//           </CDBSidebarContent>
//         </CDBSidebar>

//         {/* Yeh jagah condition wise render karega */}
//         {role === 'user' ? (<div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
//           {userrenderSection()}
//         </div>
//         ) : (<div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
//           {renderSection()}
//         </div>
//         )}
//         </div>
//         <Footer />
//       </>
//       );
// }

//       export default Dashboard;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { FaKeyboard } from 'react-icons/fa';
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from 'cdbreact';
import ShortcutsMenuItem from './ShortcutsMenuItem';

function Dashboard() {
  const role = localStorage.getItem("role");

  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem("activeSection") || "";
  });

  const handleSetActiveSection = (section) => {
    setActiveSection(section);
    localStorage.setItem("activeSection", section);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            handleSetActiveSection("account");
            break;
          case 'r':
            e.preventDefault();
            handleSetActiveSection("reviews");
            break;
          case 'i':
            e.preventDefault();
            handleSetActiveSection("notifications");
            break;
          case 's':
            e.preventDefault();
            if (role === 'user') {
              handleSetActiveSection("savedService");
            } else {
              handleSetActiveSection("savedService");
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
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
      default:
        return <div className="text-center mt-5">Please select a section</div>;
    }
  };

  const userRenderSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings />;
      case 'serviceRequests':
        return <BookService />;
      case 'savedService':
        return <SavedService />;
      case 'reviews':
        return <ReviewService />;
      case 'notifications':
        return <Notification />;
         case 'ShortCuts':
        return <ShortcutsMenuItem/>
      default:
        return <div className="text-center mt-5">Please select a section</div>;
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
                    <CDBSidebarMenuItem icon="columns">Profile</CDBSidebarMenuItem>
                  </div>
                  <div onClick={() => handleSetActiveSection("serviceRequests")}>
                    <CDBSidebarMenuItem icon="table">Service Requests</CDBSidebarMenuItem>
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
                    <div onClick={() => handleSetActiveSection("ShortCuts")}>
                    <CDBSidebarMenuItem icon="info">Shortcuts</CDBSidebarMenuItem>
                  </div>
                  
                </CDBSidebarMenu>

               
              </>
            ) : (
              <>
                <CDBSidebarMenu>
                  <div onClick={() => handleSetActiveSection("account")}>
                    <CDBSidebarMenuItem icon="columns">Profile</CDBSidebarMenuItem>
                  </div>
                  <div onClick={() => handleSetActiveSection("savedService")}>
                    <CDBSidebarMenuItem icon="plus">Add Service</CDBSidebarMenuItem>
                  </div>
                  <div onClick={() => handleSetActiveSection("serviceRequests")}>
                    <CDBSidebarMenuItem icon="table">Service Requests</CDBSidebarMenuItem>
                  </div>
                  <div onClick={() => handleSetActiveSection("reviews")}>
                    <CDBSidebarMenuItem icon="star">Reviews & Rating</CDBSidebarMenuItem>
                  </div>
                  <div onClick={() => handleSetActiveSection("notifications")}>
                    <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
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
