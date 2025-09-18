// import { Navigate, Outlet } from "react-router-dom";

// const ProtectedRoute = () => {
//     const token = localStorage.getItem("token"); // ✅ Token ko storage se check karo

//     return token ? <Outlet /> : <Navigate to="/login" />;
// };

// export default ProtectedRoute;
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    alert("You do not have permission to access this page.");
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
