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

// export default Dashboard;
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Nav, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import AccountSettings from './AccountSetting';
import ServiceList from '../Components/serviceMan/ServiceBookingRequests';
import BookService from '../FacilityPages/service';
import Footer from '../Pages/Footer';
import Navbar from '../Pages/NavbarProfile';
import ReviewService from './ReviewService';
import Notification from './Notification';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from 'cdbreact';
import { FaUser, FaWallet, FaHistory, FaBell, FaEdit, FaPowerOff } from 'react-icons/fa';
import SavedService from './SavedService';


function Dashboard() {
  const [activeSection, setActiveSection] = useState('account');
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  // yeh function decide karega kaunsa component dikhe
  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings />;
      case 'serviceRequests':
        return <ServiceList />;
      case 'savedService':
        return <h2>Saved Service</h2>;
      case 'reviews':
        return <h2>Reviews & Rating</h2>;
      case 'notifications':
        return <Notification/>
      default:
        return <AccountSettings />;
    }
  };
  const userrenderSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings />;
      case 'serviceRequests':
        return <BookService />;
      case 'savedService':
        return <SavedService/>
      case 'reviews':
        return <ReviewService/>;
      case 'notifications':
        return <Notification/>;
      default:
        return <AccountSettings />;
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
              <CDBSidebarMenu>
                <div onClick={() => setActiveSection("account")}>
                  <CDBSidebarMenuItem icon="columns">Profile</CDBSidebarMenuItem>
                </div>
                <div onClick={() => setActiveSection("serviceRequests")}>
                  <CDBSidebarMenuItem icon="table">Service Requests</CDBSidebarMenuItem>
                </div>
                <div onClick={() => setActiveSection("savedService")}>
                  <CDBSidebarMenuItem icon="heart">Saved Service</CDBSidebarMenuItem>
                </div>
                <div onClick={() => setActiveSection("reviews")}>
                  <CDBSidebarMenuItem icon="star">Reviews & Rating</CDBSidebarMenuItem>
                </div>
                <div onClick={() => setActiveSection("notifications")}>
                  <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
                </div>
              </CDBSidebarMenu>
            ) : (
              <CDBSidebarMenu>
                <div onClick={() => setActiveSection("account")}>
                  <CDBSidebarMenuItem icon="columns">Profile</CDBSidebarMenuItem>
                </div>
                <div onClick={() => setActiveSection("serviceRequests")}>
                  <CDBSidebarMenuItem icon="table">Service Requests</CDBSidebarMenuItem>
                </div>
                <div onClick={() => setActiveSection("savedService")}>
                  <CDBSidebarMenuItem icon="heart">Saved Service</CDBSidebarMenuItem>
                </div>
                <div onClick={() => setActiveSection("reviews")}>
                  <CDBSidebarMenuItem icon="star">Reviews & Rating</CDBSidebarMenuItem>
                </div>
                <div onClick={() => setActiveSection("notifications")}>
                  <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
                </div>
              </CDBSidebarMenu>
            )}
          </CDBSidebarContent>
        </CDBSidebar>

        {/* Yeh jagah condition wise render karega */}
        {role === 'user' ? (<div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {userrenderSection()}
        </div>
        ) : (<div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {renderSection()}
        </div>
        )}
        </div>
        <Footer />
      </>
      );
}

      export default Dashboard;
