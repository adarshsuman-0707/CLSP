import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GlobalShortCut() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");

    const handleKeyDown = (e) => {
      if (!e.ctrlKey) return;
      const key = e.key.toLowerCase();

      // Default shortcuts (for all)
      const commonRoutes = {
        h: "/",               // Home
        l: "/login",          // Login
        s: "/signup",         // Signup
        f: "/forgot",         // Forgot Password
        p: "/service/serviceall" // Services Page
      };

      // Role-specific routes
      const roleBasedRoutes = {
        user: {
          d: "/user/profile", // User Dashboard
        },
        service: {
          b: "/service/profile", // Service Dashboard
        },
      };

      let route = commonRoutes[key];

      if (!route && role && roleBasedRoutes[role]) {
        route = roleBasedRoutes[role][key];
      }

      if (route) {
        e.preventDefault();
        navigate(route);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return null;
}

export default GlobalShortCut;
