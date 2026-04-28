import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { requestPasswordReset, verifyOtp, resetPassword } from "../Services/operation/authcall.js";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./Navbars.js";
import Footer from "./Footer.js";
import "./Stylesheet/Login.css";

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();

  // States
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Watch password for confirmation validation
  const password = watch("password", "");

  // Step 1: Request OTP
  const handleRequestOtp = async (data) => {
    setLoading(true);
    try {
      const message = await requestPasswordReset({ email: data.email });
      
      if (message === "User not found!") {
        toast.error("❌ Email not registered. Please signup first!");
        setTimeout(() => navigate('/signup'), 2000);
      } else {
        setEmail(data.email);
        toast.success("📧 OTP sent to your email!");
        setStep(2);
      }
    } catch (error) {
      toast.error(error?.message || "❌ Failed to send OTP. Try again!");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("❌ Please enter a valid 6-digit OTP!");
      return;
    }

    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      toast.success("✅ OTP Verified! Set your new password.");
      setStep(3);
    } catch (error) {
      toast.error(error?.message || "❌ Invalid OTP. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (data) => {
    setLoading(true);
    try {
      await resetPassword({ email, password: data.password });
      toast.success("🎉 Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error?.message || "❌ Failed to reset password. Try again!");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await requestPasswordReset({ email });
      toast.success("📧 OTP resent to your email!");
    } catch (error) {
      toast.error("❌ Failed to resend OTP!");
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
            <div className="text" data-text="Processing"></div>
          </div>
        </div>
      )}

      <section className="login-wrapper d-flex justify-content-center align-items-center bg-image1">
        <div className="login-form-container fade-in">
          {/* Header */}
          <div className="text-center mb-4">
            <h3 className="text-primary fw-bold mb-2">
              {step === 1 && "🔐 Forgot Password"}
              {step === 2 && "📧 Verify OTP"}
              {step === 3 && "🔑 Reset Password"}
            </h3>
            <p className="text-muted small">
              {step === 1 && "Enter your email to receive OTP"}
              {step === 2 && "Enter the 6-digit code sent to your email"}
              {step === 3 && "Create a new strong password"}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="d-flex justify-content-center mb-4">
            <div className="d-flex align-items-center gap-2">
              <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1</div>
              <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
              <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2</div>
              <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
              <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3</div>
            </div>
          </div>

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleSubmit(handleRequestOtp)}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email Address <span className="text-danger">*</span></label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
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

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : '📧 Send OTP'}
              </button>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Remember your password?{' '}
                  <a href="/login" className="text-primary text-decoration-none fw-semibold">
                    Login here
                  </a>
                </small>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Enter OTP <span className="text-danger">*</span></label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="form-control text-center"
                  maxLength={6}
                  style={{ fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                />
                <small className="text-muted d-block mt-2 text-center">
                  OTP sent to: <strong>{email}</strong>
                </small>
              </div>

              <button
                onClick={handleVerifyOtp}
                className="btn btn-success w-100 py-2 fw-semibold mb-2"
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : '✓ Verify OTP'}
              </button>

              <div className="d-flex justify-content-between align-items-center">
                <button
                  onClick={handleResendOtp}
                  className="btn btn-link text-decoration-none p-0"
                  disabled={loading}
                >
                  🔄 Resend OTP
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-link text-decoration-none p-0"
                >
                  ← Change Email
                </button>
              </div>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleSubmit(handleResetPassword)}>
              <div className="mb-3">
                <label className="form-label fw-semibold">New Password <span className="text-danger">*</span></label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password (min 6 characters)"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <small className="text-danger d-block mt-1">{errors.password.message}</small>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Confirm Password <span className="text-danger">*</span></label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: value => value === password || "Passwords do not match"
                    })}
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <small className="text-danger d-block mt-1">{errors.confirmPassword.message}</small>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold"
                disabled={loading}
              >
                {loading ? 'Resetting Password...' : '🔑 Reset Password'}
              </button>
            </form>
          )}
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

      {/* Custom Styles for Progress Indicator */}
      <style jsx>{`
        .step-indicator {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: #e9ecef;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .step-indicator.active {
          background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
        }

        .step-line {
          width: 40px;
          height: 3px;
          background: #e9ecef;
          transition: all 0.3s ease;
        }

        .step-line.active {
          background: linear-gradient(90deg, #0d6efd 0%, #0a58ca 100%);
        }

        @media (max-width: 576px) {
          .step-indicator {
            width: 30px;
            height: 30px;
            font-size: 0.8rem;
          }

          .step-line {
            width: 30px;
          }
        }
      `}</style>
    </>
  );
};

export default ForgotPassword;
