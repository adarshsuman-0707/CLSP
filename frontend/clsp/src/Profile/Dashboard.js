import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Nav, Image } from 'react-bootstrap';
import AccountSettings from './AccountSetting';
import Navbar from '../Pages/NavbarProfile';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  CDBSidebar,
  CDBSidebarContent,
  CDBSidebarHeader,
  CDBSidebarMenu,
  CDBSidebarMenuItem,
} from 'cdbreact';
import { NavLink } from 'react-router-dom';
import { FaUser, FaWallet, FaHistory, FaBell, FaEdit, FaPowerOff } from 'react-icons/fa';


const role=localStorage.getItem("role")
function Dashboard() {
  const [activeSection, setActiveSection] = useState('account');
  
  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings />;
      case 'wallet':
        return <h2>Wallet Section</h2>; // Replace with Wallet component
      case 'purchaseHistory':
        return <h2>Purchase History</h2>; // Replace with PurchaseHistory component
      case 'notifications':
        return <h2>Notifications</h2>; // Replace with Notifications component
      default:
        return <AccountSettings />;
    }
  };

  return (
    <>
    <Navbar />
      <div className = ' 'style={{ display: 'flex', height: '100vh',overflow: 'scroll initial' }}>
      <CDBSidebar textColor="#fff" backgroundColor="#333" className=''>
      <CDBSidebarHeader className='mt-5 p-3'  prefix={<i className="fa fa-bars fa-large"></i>}>
  <span>Dashboard</span>
</CDBSidebarHeader>


        <CDBSidebarContent className="sidebar-content">
        {role==="user"? ( <CDBSidebarMenu>
            <NavLink exact to="/user/profile" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="columns">Profile</CDBSidebarMenuItem>
            </NavLink>
            <NavLink exact to="/service/bookRequest" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="table">Service Requests</CDBSidebarMenuItem>
            </NavLink>
            <NavLink exact to="/profile" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="heart">saved service</CDBSidebarMenuItem>
            </NavLink>
            <NavLink exact to="/analytics" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="star">Reviews & Rating</CDBSidebarMenuItem>
            </NavLink>

            <NavLink exact to="/hero404" target="_blank" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
            </NavLink>
          </CDBSidebarMenu>
):(<CDBSidebarMenu>
            <NavLink exact to="/Facilator/profile" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="columns">Profile</CDBSidebarMenuItem>
            </NavLink>
            <NavLink exact to="/service/bookRequest" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="table">Service Requests</CDBSidebarMenuItem>
            </NavLink>
            <NavLink exact to="/profile" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="heart">saved service</CDBSidebarMenuItem>
            </NavLink>
            <NavLink exact to="/analytics" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="star">Reviews & Rating</CDBSidebarMenuItem>
            </NavLink>

            <NavLink exact to="/hero404" target="_blank" activeClassName="activeClicked">
              <CDBSidebarMenuItem icon="exclamation-circle">Notifications</CDBSidebarMenuItem>
            </NavLink>
          </CDBSidebarMenu>
        )}
        </CDBSidebarContent>

       
      </CDBSidebar> 
      
      <AccountSettings />
     
    
    </div>
  
    </>
  );
}

export default Dashboard;