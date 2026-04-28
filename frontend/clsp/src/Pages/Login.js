import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { LoginUser } from "../Services/operation/authcall.js";
import { NavLink, useNavigate } from "react-router-dom";
import Navbar from "./Navbars.js";
import './Stylesheet/Login.css';
import Footer from "./Footer.js";

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await LoginUser(data);

      if (response.message === "Login Succesfully") {
        localStorage.setItem("isLogin", true);
        localStorage.setItem("token", response.token);
        localStorage.setItem("serviceID", response.userData._id);
        localStorage.setItem("role", response.userData.role);
        
        toast.success("✅ Login Successful! Redirecting...", { autoClose: 2000 });
        setTimeout(() => navigate("/"), 1500);
      } else {
        toast.error("❌ Invalid Credentials. Try Again!", { autoClose: 2000 });
      }
    } catch (error) {
      const code = error?.code;
      const msg = error?.message;

      if (code === "ACCOUNT_BLOCKED") {
        toast.error("🚫 Your account has been suspended. Contact support.", { autoClose: 5000 });
      } else if (code === "PENDING_APPROVAL") {
        toast.warn("⏳ Your vendor account is pending admin approval.", { autoClose: 5000 });
      } else if (msg) {
        toast.error(`❌ ${msg}`, { autoClose: 3000 });
      } else {
        toast.error("❌ Login Failed! Please check your details.", { autoClose: 2000 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* Loading Overlay */}
      {loading && (
        <div className="Loading">
          <div id="wifi-loader">
            <svg className="circle-outer" viewBox="0 0 86 86">
              <circle className="back" cx="43" cy="43" r="40"></circle>
              <circle className="front" cx="43" cy="43" r="40"></circle>
              <circle className="new" cx="43" cy="43" r="40"></circle>
            </svg>
            <svg className="circle-middle" viewBox="0 0 60 60">
              <circle className="back" cx="30" cy="30" r="27"></circle>
              <circle className="front" cx="30" cy="30" r="27"></circle>
            </svg>
            <svg className="circle-inner" viewBox="0 0 34 34">
              <circle className="back" cx="17" cy="17" r="14"></circle>
              <circle className="front" cx="17" cy="17" r="14"></circle>
            </svg>
            <div className="text" data-text="Connecting"></div>
          </div>
        </div>
      )}

      <section className="login-wrapper d-flex justify-content-center align-items-center bg-image1">
        <div className="login-form-container fade-in">
          <div className="text-center mb-4">
            <h3 className="text-primary fw-bold mb-2">Welcome Back!</h3>
            <p className="text-muted small">Login to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address <span className="text-danger">*</span></label>
              <input
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email format"
                  }
                })}
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                autoComplete="email"
              />
              {errors.email && (
                <small className="text-danger d-block mt-1">{errors.email.message}</small>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-3">
              <label className="form-label fw-semibold">Password <span className="text-danger">*</span></label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <small className="text-danger d-block mt-1">{errors.password.message}</small>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-end mb-3">
              <NavLink to="/forgot" className="text-secondary text-decoration-none small">
                Forgot Password?
              </NavLink>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? 'Logging in...' : '🔐 Login'}
            </button>
          </form>

          {/* Signup Link */}
          <div className="text-center mt-4">
            <small className="text-muted">
              Don't have an account?{' '}
              <NavLink to="/signup" className="text-primary text-decoration-none fw-semibold">
                Create one now
              </NavLink>
            </small>
          </div>

          {/* Divider */}
          <div className="position-relative my-4">
            <hr className="text-muted" />
            <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
              or
            </span>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <small className="text-muted">
              By logging in, you agree to our{' '}
              <a href="/terms" className="text-decoration-none">Terms</a> and{' '}
              <a href="/privacy" className="text-decoration-none">Privacy Policy</a>
            </small>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Toast Container - Fixed positioning, no layout impact */}
      <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 9999 }}>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
        />
      </div>
    </>
  );
};

export default Login;
