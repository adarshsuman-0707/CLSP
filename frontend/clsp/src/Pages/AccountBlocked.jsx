import { useNavigate } from "react-router-dom";

const AccountBlocked = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

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
      <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🚫</div>
      <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Account Suspended
      </h1>
      <p style={{ fontSize: "1.05rem", opacity: 0.8, maxWidth: 460, marginBottom: "2rem", lineHeight: 1.7 }}>
        Your account has been suspended by the administrator. If you believe this is a mistake,
        please contact our support team.
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <a
          href="mailto:support@clsp.com"
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            padding: "0.6rem 1.5rem",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: 600,
            border: "1px solid rgba(255,255,255,0.3)",
          }}
        >
          ✉ Contact Support
        </a>
        <button
          onClick={handleLogout}
          style={{
            background: "#dc3545",
            color: "#fff",
            padding: "0.6rem 1.5rem",
            borderRadius: "8px",
            border: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default AccountBlocked;
