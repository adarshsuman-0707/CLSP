import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function GlobalShortCut() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "h": // Ctrl + H → Home
            e.preventDefault();
            navigate("/");
            break;
          case "l": // Ctrl + L → Login
            e.preventDefault();
            navigate("/login");
            break;
          case "s": // Ctrl + S → Signup
            e.preventDefault();
            navigate("/signup");
            break;
          case "f": // Ctrl + F → Forgot Password
            e.preventDefault();
            navigate("/forgot");
            break;
          case "d": // Ctrl + D → User Dashboard
            e.preventDefault();
            navigate("/user/profile");
            break;
          case "p": // Ctrl + P → Service Provider Page
            e.preventDefault();
            navigate("/service/serviceall");
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return null; // nothing to render
}

export default GlobalShortCut;
