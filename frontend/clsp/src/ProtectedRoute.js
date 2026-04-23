import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");

  const [status, setStatus] = useState({ checking: true, maintenance: false });

  useEffect(() => {
    if (role !== "admin") {
      axios
        .get("http://localhost:5000/api/admin/maintenance-status")
        .then((res) => {
          setStatus({ checking: false, maintenance: res.data?.maintenanceMode === true });
        })
        .catch(() => {
          setStatus({ checking: false, maintenance: false });
        });
    } else {
      setStatus({ checking: false, maintenance: false });
    }
  }, [role]);

  // No token → login
  if (!token) return <Navigate to="/login" />;

  // Wrong role → unauthorized
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Still checking maintenance
  if (status.checking) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  // Maintenance mode — block non-admins
  if (status.maintenance && role !== "admin") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          color: "#fff",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🔧</div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Under Maintenance
        </h1>
        <p style={{ fontSize: "1.1rem", opacity: 0.8, maxWidth: 480, marginBottom: "2rem" }}>
          We're currently performing scheduled maintenance to improve your experience.
          Please check back shortly.
        </p>
        <div
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "1rem 2rem",
            fontSize: "0.9rem",
            opacity: 0.7,
          }}
        >
          🕐 We'll be back soon!
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
