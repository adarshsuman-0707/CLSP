import { useNavigate } from "react-router-dom";

const PendingApproval = () => {
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
        background: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)",
        color: "#fff",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>⏳</div>
      <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Waiting for Approval
      </h1>
      <p style={{ fontSize: "1.05rem", opacity: 0.8, maxWidth: 480, marginBottom: "1rem", lineHeight: 1.7 }}>
        Your vendor account is currently under review by our admin team.
        You will be able to access the platform once your account is verified.
      </p>
      <div
        style={{
          background: "rgba(255,193,7,0.15)",
          border: "1px solid rgba(255,193,7,0.4)",
          borderRadius: "10px",
          padding: "0.8rem 1.5rem",
          marginBottom: "2rem",
          fontSize: "0.9rem",
          color: "#ffc107",
          maxWidth: 420,
        }}
      >
        ℹ️ This usually takes 24–48 hours. We'll notify you once approved.
      </div>
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
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            padding: "0.6rem 1.5rem",
            borderRadius: "8px",
            border: "1px solid rgba(255,255,255,0.3)",
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

export default PendingApproval;
