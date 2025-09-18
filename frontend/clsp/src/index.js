import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import "bootstrap/dist/css/bootstrap.min.css";
import reportWebVitals from './reportWebVitals';
import {BrowserRouter,Route, Routes} from 'react-router-dom'
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
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  
  <BrowserRouter>
  <GlobalShortCut/>
     <Routes>
     <Route path="/" element={<Home />} />
<Route path="/signup" element={<Signup />} />
<Route path="/login" element={<Login />} />
<Route path="/forgot" element={<ForgotPassword />} />

{/* Only for USERS */}
<Route element={<ProtectedRoute allowedRoles={["user"]} />}>
  <Route path="/user/profile" element={<Dashboard />} />
  <Route path="/user/service" element={<Service />} />
</Route>
<Route element={<ProtectedRoute allowedRoles={["service"]} />}>
  <Route path="/Facilator/profile" element={<Dashboard />} />
  {/* <Route path="/user/service" element={<Service />} /> */}
</Route>

{/* Only for SERVICE PROVIDERS */}
<Route element={<ProtectedRoute allowedRoles={["service"]} />}>
  <Route path="/service/serviceall" element={<ServicePage />} />
  <Route path="/service/serviceadd" element={<AddServicePage />} />
</Route>
<Route path="/unauthorized" element={<Unauthorized />} />
<Route path="*" element={<PageNotFound />} />
<Route path="/service/bookRequest" element={<ServiceBookingRequests/>}/>
</Routes>
      
  </BrowserRouter>

);

reportWebVitals();
