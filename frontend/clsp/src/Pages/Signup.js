import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import {
  SignupUser,
  verifyEmailOtp,
  verifyPhoneOtp,
  requestEmailOtp,
  requestPhoneOtp,
} from "../Services/operation/authcall";
import Navbar from "./Navbars.js";
import countriesData from "./utils/countryStateCity.json";
import Footer from "./Footer.js";
import './Stylesheet/Login.css';

const Signup = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();

  // OTP States
  const [otpSentEmail, setOtpSentEmail] = useState(false);
  const [otpSentPhone, setOtpSentPhone] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Watch password for confirmation validation
  const password = watch("password", "");

  const countryList = Object.keys(countriesData);
  const stateList = selectedCountry ? countriesData[selectedCountry].states : [];
  const cityList =
    selectedState && stateList.find((state) => state.code === selectedState)
      ? stateList.find((state) => state.code === selectedState).cities
      : [];

  // Email OTP Request
  const requestEmail = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("❌ Please enter a valid email address!");
      return;
    }
    setLoading(true);
    try {
      await requestEmailOtp({ email });
      setOtpSentEmail(true);
      toast.success("📧 Email OTP sent successfully!");
    } catch (error) {
      toast.error(error?.message || "❌ Failed to send email OTP!");
    } finally {
      setLoading(false);
    }
  };

  // Email OTP Verification
  const verifyEmail = async () => {
    if (!emailOtp || emailOtp.length !== 6) {
      toast.error("❌ Please enter a valid 6-digit OTP!");
      return;
    }
    setLoading(true);
    try {
      const response = await verifyEmailOtp({ email, otp: emailOtp });
      if (response.message === "Email verified successfully!") {
        setIsEmailVerified(true);
        toast.success("✅ Email verified successfully!");
      } else {
        toast.warning("⚠️ Invalid email OTP. Try again.");
      }
    } catch (error) {
      toast.error(error?.message || "❌ Error verifying email OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP Request
  const requestPhone = async () => {
    if (!contact || !/^[0-9]{10}$/.test(contact)) {
      toast.error("❌ Please enter a valid 10-digit phone number!");
      return;
    }
    setLoading(true);
    try {
      await requestPhoneOtp({ contact });
      setOtpSentPhone(true);
      toast.success("📲 Phone OTP sent successfully!");
    } catch (error) {
      toast.error(error?.message || "❌ Failed to send phone OTP!");
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP Verification
  const verifyPhone = async () => {
    if (!phoneOtp || phoneOtp.length !== 6) {
      toast.error("❌ Please enter a valid 6-digit OTP!");
      return;
    }
    setLoading(true);
    try {
      const response = await verifyPhoneOtp({ contact, otp: phoneOtp });
      if (response.message === "Phone verified successfully!") {
        setIsPhoneVerified(true);
        toast.success("✅ Phone verified successfully!");
      } else {
        toast.warning("⚠️ Invalid phone OTP. Try again.");
      }
    } catch (error) {
      toast.error(error?.message || "❌ Error verifying phone OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Form Submission
  const onSubmit = async (data) => {
    if (!isEmailVerified) {
      toast.warning("⚠️ Please verify your email first!");
      return;
    }
    if (!isPhoneVerified) {
      toast.warning("⚠️ Please verify your phone number first!");
      return;
    }

    setLoading(true);
    try {
      await SignupUser(data);
      toast.success("🎉 Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error?.message || "❌ Signup failed. Please try again.");
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

      <section className="signup-wrapper bg-image1">
        <div className="container py-4 py-md-5">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-9 col-xl-8">
              <div className="signup-card fade-in">
                <h2 className="text-center text-primary fw-bold mb-4">Create Account</h2>
                <p className="text-center text-muted mb-4">Join us today! Fill in your details below</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Account Type */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Account Type <span className="text-danger">*</span></label>
                    <div className="d-flex gap-4 flex-wrap">
                      <div className="form-check">
                        <input
                          type="radio"
                          id="customer"
                          value="user"
                          {...register("role", { required: "Please select account type" })}
                          className="form-check-input"
                        />
                        <label htmlFor="customer" className="form-check-label">👤 Customer</label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          id="service"
                          value="service"
                          {...register("role", { required: "Please select account type" })}
                          className="form-check-input"
                        />
                        <label htmlFor="service" className="form-check-label">🔧 Service Provider</label>
                      </div>
                    </div>
                    {errors.role && <small className="text-danger">{errors.role.message}</small>}
                  </div>

                  {/* Name Fields */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Username <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        placeholder="Enter username"
                        {...register("username", {
                          required: "Username is required",
                          minLength: { value: 3, message: "Minimum 3 characters" },
                          pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Only letters, numbers, and underscore" }
                        })}
                        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                      />
                      {errors.username && <small className="text-danger">{errors.username.message}</small>}
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">First Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        placeholder="Enter first name"
                        {...register("firstname", {
                          required: "First name is required",
                          minLength: { value: 2, message: "Minimum 2 characters" }
                        })}
                        className={`form-control ${errors.firstname ? 'is-invalid' : ''}`}
                      />
                      {errors.firstname && <small className="text-danger">{errors.firstname.message}</small>}
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Last Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        placeholder="Enter last name"
                        {...register("lastname", {
                          required: "Last name is required",
                          minLength: { value: 2, message: "Minimum 2 characters" }
                        })}
                        className={`form-control ${errors.lastname ? 'is-invalid' : ''}`}
                      />
                      {errors.lastname && <small className="text-danger">{errors.lastname.message}</small>}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Gender <span className="text-danger">*</span></label>
                    <select
                      className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                      {...register("gender", { required: "Please select gender" })}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <small className="text-danger">{errors.gender.message}</small>}
                  </div>

                  {/* Email with OTP */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        {...register("email", {
                          required: "Email is required",
                          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email format" }
                        })}
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isEmailVerified}
                      />
                      {isEmailVerified && (
                        <span className="input-group-text bg-success text-white">✓ Verified</span>
                      )}
                    </div>
                    {errors.email && <small className="text-danger d-block">{errors.email.message}</small>}
                    
                    {!isEmailVerified && !otpSentEmail && (
                      <button
                        type="button"
                        onClick={requestEmail}
                        className="btn btn-outline-primary btn-sm mt-2 w-100"
                        disabled={loading}
                      >
                        📧 Send Email OTP
                      </button>
                    )}
                    
                    {otpSentEmail && !isEmailVerified && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="form-control mb-2"
                          maxLength={6}
                        />
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            onClick={verifyEmail}
                            className="btn btn-success btn-sm flex-grow-1"
                            disabled={loading || emailOtp.length !== 6}
                          >
                            ✓ Verify Email
                          </button>
                          <button
                            type="button"
                            onClick={requestEmail}
                            className="btn btn-outline-secondary btn-sm"
                            disabled={loading}
                          >
                            Resend
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone with OTP */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Phone Number <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <input
                        type="tel"
                        placeholder="Enter 10-digit phone number"
                        {...register("contact", {
                          required: "Phone number is required",
                          pattern: { value: /^[0-9]{10}$/, message: "Must be 10 digits" }
                        })}
                        className={`form-control ${errors.contact ? 'is-invalid' : ''}`}
                        onChange={(e) => setContact(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        maxLength={10}
                        disabled={isPhoneVerified}
                      />
                      {isPhoneVerified && (
                        <span className="input-group-text bg-success text-white">✓ Verified</span>
                      )}
                    </div>
                    {errors.contact && <small className="text-danger d-block">{errors.contact.message}</small>}
                    
                    {!isPhoneVerified && !otpSentPhone && (
                      <button
                        type="button"
                        onClick={requestPhone}
                        className="btn btn-outline-primary btn-sm mt-2 w-100"
                        disabled={loading}
                      >
                        📲 Send Phone OTP
                      </button>
                    )}
                    
                    {otpSentPhone && !isPhoneVerified && (
                      <div className="mt-2">
                        <input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={phoneOtp}
                          onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="form-control mb-2"
                          maxLength={6}
                        />
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            onClick={verifyPhone}
                            className="btn btn-success btn-sm flex-grow-1"
                            disabled={loading || phoneOtp.length !== 6}
                          >
                            ✓ Verify Phone
                          </button>
                          <button
                            type="button"
                            onClick={requestPhone}
                            className="btn btn-outline-secondary btn-sm"
                            disabled={loading}
                          >
                            Resend
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Address <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter your address"
                      {...register("address", { required: "Address is required" })}
                      className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                    />
                    {errors.address && <small className="text-danger">{errors.address.message}</small>}
                  </div>

                  {/* Country, State, City */}
                  <div className="row g-3 mb-3">
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">Country <span className="text-danger">*</span></label>
                      <select
                        className={`form-select ${errors.country ? 'is-invalid' : ''}`}
                        {...register("country", { required: "Please select country" })}
                        value={selectedCountry}
                        onChange={(e) => {
                          setSelectedCountry(e.target.value);
                          setSelectedState("");
                        }}
                      >
                        <option value="">Select Country</option>
                        {countryList.map((code) => (
                          <option key={code} value={code}>{countriesData[code].name}</option>
                        ))}
                      </select>
                      {errors.country && <small className="text-danger">{errors.country.message}</small>}
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">State <span className="text-danger">*</span></label>
                      <select
                        className={`form-select ${errors.state ? 'is-invalid' : ''}`}
                        {...register("state", { required: "Please select state" })}
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        disabled={!selectedCountry}
                      >
                        <option value="">Select State</option>
                        {stateList.map((state) => (
                          <option key={state.code} value={state.code}>{state.name}</option>
                        ))}
                      </select>
                      {errors.state && <small className="text-danger">{errors.state.message}</small>}
                    </div>
                    <div className="col-12 col-md-4">
                      <label className="form-label fw-semibold">City <span className="text-danger">*</span></label>
                      <select
                        className={`form-select ${errors.city ? 'is-invalid' : ''}`}
                        {...register("city", { required: "Please select city" })}
                        disabled={!selectedState}
                      >
                        <option value="">Select City</option>
                        {cityList.map((city, index) => (
                          <option key={index} value={city}>{city}</option>
                        ))}
                      </select>
                      {errors.city && <small className="text-danger">{errors.city.message}</small>}
                    </div>
                  </div>

                  {/* Pincode */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Pincode <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      placeholder="Enter 6-digit pincode"
                      {...register("pincode", {
                        required: "Pincode is required",
                        pattern: { value: /^[0-9]{6}$/, message: "Must be 6 digits" }
                      })}
                      className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
                      maxLength={6}
                      onChange={(e) => e.target.value = e.target.value.replace(/\D/g, '')}
                    />
                    {errors.pincode && <small className="text-danger">{errors.pincode.message}</small>}
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Password <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password (min 6 characters)"
                        {...register("password", {
                          required: "Password is required",
                          minLength: { value: 6, message: "Minimum 6 characters required" }
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
                    {errors.password && <small className="text-danger d-block">{errors.password.message}</small>}
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Confirm Password <span className="text-danger">*</span></label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        {...register("confirmPassword", {
                          required: "Please confirm password",
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
                    {errors.confirmPassword && <small className="text-danger d-block">{errors.confirmPassword.message}</small>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-semibold"
                    disabled={loading || !isEmailVerified || !isPhoneVerified}
                  >
                    {loading ? 'Creating Account...' : '🚀 Create Account'}
                  </button>

                  {/* Login Link */}
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      Already have an account?{' '}
                      <a href="/login" className="text-primary text-decoration-none fw-semibold">
                        Login here
                      </a>
                    </small>
                  </div>
                </form>
              </div>
            </div>
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

export default Signup;
