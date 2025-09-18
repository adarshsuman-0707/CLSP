import React from "react";

const Unauthorized = () => {
  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg text-center p-4" style={{ maxWidth: "500px" }}>
        <div className="card-body">
          <div className="mb-3">
            <i className="bi bi-shield-lock text-danger" style={{ fontSize: "3rem" }}></i>
          </div>
          <h2 className="card-title text-danger">🚫 Access Denied</h2>
          <p className="card-text text-muted">
            You are not allowed to access this page. Please check your account
            permissions or go back to the home page.
          </p>
          <a href="/" className="btn btn-primary mt-3">
            Go to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
