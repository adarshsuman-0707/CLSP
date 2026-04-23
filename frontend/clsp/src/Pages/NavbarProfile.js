import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "./Stylesheet/Navbar.css";

const NavbarProfile = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isLogin") === "true"
  );
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  useEffect(() => {
    setIsAuthenticated(localStorage.getItem("isLogin") === "true");
  }, [location]);

  // Handle body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add("offcanvas-open");
    } else {
      document.body.classList.remove("offcanvas-open");
    }
    return () => {
      document.body.classList.remove("offcanvas-open");
    };
  }, [mobileOpen]);

  const profilePath =
    role === "admin"
      ? "/admin/profile"
      : role === "service"
      ? "/Service/profile"
      : "/user/profile";

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate("/");
  };

  // Helper to navigate within dashboard by setting activeSection in localStorage
  const navigateToDashboardSection = (section) => {
    localStorage.setItem("activeSection", section);
    // Dispatch custom event to notify Dashboard component
    window.dispatchEvent(new CustomEvent("dashboardSectionChange", { detail: { section } }));
    
    // Only navigate if not already on dashboard page
    if (location.pathname !== profilePath) {
      navigate(profilePath);
    }
    setMobileOpen(false);
  };

  return (
    <>
      <Navbar expand="lg" bg="dark" variant="dark" fixed="top" className="p-3">
        <Container>
          <Navbar.Brand
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
            className="fw-bold"
          >
            🔧 CLSP
          </Navbar.Brand>

          {/* Desktop nav */}
          <Nav className="ms-auto d-none d-lg-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Role badge */}
                <span
                  className={`badge ${
                    role === "admin"
                      ? "bg-danger"
                      : role === "service"
                      ? "bg-warning text-dark"
                      : "bg-success"
                  }`}
                >
                  {role?.toUpperCase()}
                </span>

                {/* Dashboard link */}
                <Nav.Link
                  onClick={() => navigate(profilePath)}
                  className="text-white"
                  style={{ cursor: "pointer" }}
                >
                  📊 Dashboard
                </Nav.Link>

                {/* Role-specific quick links */}
                {role === "user" && (
                  <>
                    <Nav.Link 
                      onClick={() => navigateToDashboardSection("services")} 
                      className="text-white"
                      style={{ cursor: "pointer" }}
                    >
                      📋 Services
                    </Nav.Link>
                    <Nav.Link 
                      onClick={() => navigateToDashboardSection("packages")} 
                      className="text-white"
                      style={{ cursor: "pointer" }}
                    >
                      📦 Packages
                    </Nav.Link>
                    <Nav.Link 
                      onClick={() => navigateToDashboardSection("invoices")} 
                      className="text-white"
                      style={{ cursor: "pointer" }}
                    >
                      🧾 Invoices
                    </Nav.Link>
                  </>
                )}

                {role === "service" && (
                  <>
                    <Nav.Link 
                      onClick={() => navigateToDashboardSection("savedService")} 
                      className="text-white"
                      style={{ cursor: "pointer" }}
                    >
                      🔧 My Services
                    </Nav.Link>
                    <Nav.Link 
                      onClick={() => navigateToDashboardSection("invoices")} 
                      className="text-white"
                      style={{ cursor: "pointer" }}
                    >
                      🧾 Invoices
                    </Nav.Link>
                  </>
                )}

                {role === "admin" && (
                  <>
                    <Nav.Link 
                      onClick={() => navigateToDashboardSection("managePackages")} 
                      className="text-white"
                      style={{ cursor: "pointer" }}
                    >
                      📦 Packages
                    </Nav.Link>
                    <Nav.Link 
                      onClick={() => navigateToDashboardSection("invoices")} 
                      className="text-white"
                      style={{ cursor: "pointer" }}
                    >
                      🧾 Invoices
                    </Nav.Link>
                  </>
                )}

                {/* Logout button */}
                <button className="btn btn-danger btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={() => navigate("/login")}>
                  Login
                </button>
                <button className="btn btn-success btn-sm" onClick={() => navigate("/signup")}>
                  Signup
                </button>
              </div>
            )}
          </Nav>

          {/* Mobile hamburger - only show on small screens */}
          <button
            className="btn btn-outline-light d-lg-none"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            ☰
          </button>
        </Container>
      </Navbar>

      {/* Mobile offcanvas menu */}
      <div className={`offcanvas-menu ${mobileOpen ? "show" : ""}`}>
        <div className="offcanvas-content">
          <button className="close-btn" onClick={() => setMobileOpen(false)}>✖</button>
          <Nav className="flex-column mt-3">
            {isAuthenticated ? (
              <>
                {role && (
                  <span className={`badge mb-2 ${role === "admin" ? "bg-danger" : role === "service" ? "bg-warning text-dark" : "bg-success"}`}>
                    {role.toUpperCase()}
                  </span>
                )}
                <Nav.Link className="text-white" onClick={() => { navigate(profilePath); setMobileOpen(false); }}>
                  📊 Dashboard
                </Nav.Link>

                {role === "user" && (
                  <>
                    <Nav.Link className="text-white" onClick={() => navigateToDashboardSection("services")}>
                      📋 Services
                    </Nav.Link>
                    <Nav.Link className="text-white" onClick={() => navigateToDashboardSection("packages")}>
                      📦 Packages
                    </Nav.Link>
                    <Nav.Link className="text-white" onClick={() => navigateToDashboardSection("invoices")}>
                      🧾 Invoices
                    </Nav.Link>
                  </>
                )}

                {role === "service" && (
                  <>
                    <Nav.Link className="text-white" onClick={() => navigateToDashboardSection("savedService")}>
                      🔧 My Services
                    </Nav.Link>
                    <Nav.Link className="text-white" onClick={() => navigateToDashboardSection("invoices")}>
                      🧾 Invoices
                    </Nav.Link>
                  </>
                )}

                {role === "admin" && (
                  <>
                    <Nav.Link className="text-white" onClick={() => navigateToDashboardSection("managePackages")}>
                      📦 Packages
                    </Nav.Link>
                    <Nav.Link className="text-white" onClick={() => navigateToDashboardSection("invoices")}>
                      🧾 Invoices
                    </Nav.Link>
                  </>
                )}

                <Nav.Link className="text-white" onClick={() => { navigate("/"); setMobileOpen(false); }}>
                  🏠 Home
                </Nav.Link>
                <button className="btn btn-danger mt-3" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn btn-primary mb-2 mt-3" onClick={() => { navigate("/login"); setMobileOpen(false); }}>Login</button>
                <button className="btn btn-success" onClick={() => { navigate("/signup"); setMobileOpen(false); }}>Signup</button>
              </>
            )}
          </Nav>
        </div>
      </div>
    </>
  );
};

export default NavbarProfile;
