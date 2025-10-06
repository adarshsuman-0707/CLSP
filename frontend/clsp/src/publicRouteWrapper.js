// src/Components/PublicRoute.js
import { Navigate } from "react-router-dom";

const PublicRoute = ({ element: Component }) => {
  const role = localStorage.getItem("role");

  // If logged in (any role), redirect to appropriate dashboard
  if (role === "user") return <Navigate to="/user/profile" replace />;
  if (role === "service") return <Navigate to="/service/profile" replace />;
  if (role === "admin") return <Navigate to="/admin/dashboard" replace />;

  // Otherwise, allow access
  return Component;
};

export default PublicRoute;
