import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "./Stylesheet/Navbar.css";
import { Link } from "react-scroll";

const Navbars = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("isLogin") === "true"
  );
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  // keep auth state in sync when localStorage changes
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

  const navLinks = [
    { label: "About", to: "about", offset: -70 },
    { label: "Services", to: "services", offset: -70 },
    { label: "Contact", to: "contactUs", offset: -20 },
  ];

  // Check if we're on home page
  const isHomePage = location.pathname === '/';

  // Handle navigation link click
  const handleNavLinkClick = (linkTo) => {
    if (!isHomePage) {
      // If not on home page, navigate to home first, then scroll
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(linkTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
    // If on home page, react-scroll Link will handle it
  };

  return (
    <>
      <Navbar expand="lg" bg="dark" variant="dark" fixed="top" className="p-3" style={{ width: '100%' }}>
        <Container fluid style={{ maxWidth: '100%', padding: '0 15px' }}>
          <Navbar.Brand href="/" className="fw-bold">
            🔧 CLSP
          </Navbar.Brand>

          {/* Desktop nav */}
          <Nav className="ms-auto d-none d-lg-flex align-items-center gap-2">
            {navLinks.map((l) => (
              isHomePage ? (
                <Link
                  key={l.to}
                  to={l.to}
                  spy smooth
                  duration={500}
                  offset={l.offset}
                  className="nav-link text-white"
                  style={{ cursor: "pointer" }}
                >
                  {l.label}
                </Link>
              ) : (
                <span
                  key={l.to}
                  onClick={() => handleNavLinkClick(l.to)}
                  className="nav-link text-white"
                  style={{ cursor: "pointer" }}
                >
                  {l.label}
                </span>
              )
            ))}

            {isAuthenticated ? (
              <label className="popup ms-2">
                <input type="checkbox" />
                <div tabIndex={0} className="burger">
                  {/* avatar icon */}
                  <svg viewBox="0 0 24 24" fill="white" height="20" width="20">
                    <path d="M12 2c2.757 0 5 2.243 5 5.001 0 2.756-2.243 5-5 5s-5-2.244-5-5c0-2.758 2.243-5.001 5-5.001zm0-2c-3.866 0-7 3.134-7 7.001 0 3.865 3.134 7 7 7s7-3.135 7-7c0-3.867-3.134-7.001-7-7.001zm6.369 13.353c-.497.498-1.057.931-1.658 1.302 2.872 1.874 4.378 5.083 4.972 7.346h-19.387c.572-2.29 2.058-5.503 4.973-7.358-.603-.374-1.162-.811-1.658-1.312-4.258 3.072-5.611 8.506-5.611 10.669h24c0-2.142-1.44-7.557-5.631-10.647z" />
                  </svg>
                </div>
                <nav className="popup-window">
                  <ul>
                    {/* role badge */}
                    <li style={{ padding: "4px 16px" }}>
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
                    </li>
                    <li>
                      <button onClick={() => navigate(profilePath)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>Dashboard</span>
                      </button>
                    </li>
                    {role === "user" && (
                      <li>
                        <button onClick={() => navigate("/packages")}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                          </svg>
                          <span>Packages</span>
                        </button>
                      </li>
                    )}
                    {role === "admin" && (
                      <li>
                        <button onClick={() => navigate("/admin/packages")}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                          </svg>
                          <span>Manage Packages</span>
                        </button>
                      </li>
                    )}
                    <hr style={{ margin: "4px 0" }} />
                    <li>
                      <button onClick={handleLogout}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                        </svg>
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </label>
            ) : (
              <div className="d-flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={() => navigate("/login")}>Login</button>
                <button className="btn btn-success btn-sm" onClick={() => navigate("/signup")}>Signup</button>
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

      {/* Mobile drawer */}
      <div className={`offcanvas-menu ${mobileOpen ? "show" : ""}`}>
        <div className="offcanvas-content">
          <button className="close-btn" onClick={() => setMobileOpen(false)}>✖</button>
          <Nav className="flex-column mt-3">
            {navLinks.map((l) => (
              isHomePage ? (
                <Link
                  key={l.to}
                  to={l.to}
                  spy smooth
                  duration={500}
                  offset={l.offset}
                  className="nav-link text-white py-2"
                  onClick={() => setMobileOpen(false)}
                  style={{ cursor: "pointer" }}
                >
                  {l.label}
                </Link>
              ) : (
                <span
                  key={l.to}
                  onClick={() => {
                    handleNavLinkClick(l.to);
                    setMobileOpen(false);
                  }}
                  className="nav-link text-white py-2"
                  style={{ cursor: "pointer" }}
                >
                  {l.label}
                </span>
              )
            ))}
            {isAuthenticated ? (
              <>
                {role && (
                  <span className={`badge mt-2 mb-1 ${role === "admin" ? "bg-danger" : role === "service" ? "bg-warning text-dark" : "bg-success"}`}>
                    {role.toUpperCase()}
                  </span>
                )}
                <Nav.Link className="text-white" onClick={() => { navigate(profilePath); setMobileOpen(false); }}>Dashboard</Nav.Link>
                {/* {role === "user" && (
                  <Nav.Link className="text-white" onClick={() => { navigate("/packages"); setMobileOpen(false); }}>Packages</Nav.Link>
                )}
                {role === "admin" && (
                  <Nav.Link className="text-white" onClick={() => { navigate("/admin/packages"); setMobileOpen(false); }}>Manage Packages</Nav.Link>
                )} */}
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

export default Navbars;
