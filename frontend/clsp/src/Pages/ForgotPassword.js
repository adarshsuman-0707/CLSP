import React, { useState } from "react";
import { requestPasswordReset, verifyOtp, resetPassword } from "../Services/operation/authcall.js";
import { toast,ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./Navbars.js";
import "../Pages/Stylesheet/ForgotPassword.css"

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP, 3: Reset Password
  const navigate = useNavigate();

  // 📌 Step 1: Request Password Reset OTP
  const handleRequestOtp = async () => {
    try {
      await requestPasswordReset({ email });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(error);
    }
  };

  // 📌 Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    try {
      await verifyOtp({ email, otp });
      toast.success("OTP Verified! Enter a new password.");
      setStep(3);
    } catch (error) {
      toast.error(error);
    }
  };

  // 📌 Step 3: Reset Password
  const handleResetPassword = async () => {
    try {
      await resetPassword({ email, password });
      toast.success("Password reset successfully!");
      setEmail("");
      setOtp("");
      setPassword("");
      navigate("/login");
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="forgot-container">
        <div className={`forgot-card animate__animated ${step === 1 ? "animate__fadeInDown" : step === 2 ? "animate__fadeInLeft" : "animate__fadeInRight"}`}>
          <h2 className="text-center text-white">Forgot Password</h2>

          {step === 1 && (
            <>
              <input
                type="email"
                className="form-control my-2"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button className="btn btn-primary w-100" onClick={handleRequestOtp}>
                Send OTP
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input
                type="text"
                className="form-control my-2"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <button className="btn btn-warning w-100" onClick={handleVerifyOtp}>
                Verify OTP
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <input
                type="password"
                className="form-control my-2"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button className="btn btn-success w-100" onClick={handleResetPassword}>
                Reset Password
              </button>
            </>
          )}
        </div>
        <ToastContainer/>
      </div>
    </>
  );
};

export default ForgotPassword;
