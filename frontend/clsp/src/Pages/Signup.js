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
import axios from "axios";

const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [otpSentEmail, setOtpSentEmail] = useState(false);
  const [otpSentPhone, setOtpSentPhone] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [pincode, setPincode] = useState("");
  const countryList = Object.keys(countriesData);
  const stateList = selectedCountry ? countriesData[selectedCountry].states : [];
  const cityList =
    selectedState && stateList.find((state) => state.code === selectedState)
      ? stateList.find((state) => state.code === selectedState).cities
      : [];

  const navigate = useNavigate();

  const requestEmail = async () => {
    try {
      await requestEmailOtp({ email });
      setOtpSentEmail(true);
      toast.info("📧 Email OTP sent. Check your inbox!");
    } catch (error) {
      toast.error("❌ Failed to send email OTP. Try again!");
    }
  };

  const verifyEmail = async () => {
    try {
      const response = await verifyEmailOtp({ email, otp: emailOtp });
      if (response.message === "Email verified successfully!") {
        setIsEmailVerified(true);
        toast.success("✅ Email verified successfully!");
      } else {
        toast.warning("⚠️ Invalid email OTP. Try again.");
      }
    } catch (error) {
      toast.error("❌ Error verifying email OTP.");
    }
  };

  const requestPhone = async () => {
    try {
      await requestPhoneOtp({ contact });
      setOtpSentPhone(true);
      toast.info("📲 Phone OTP sent. Check your SMS!");
    } catch (error) {
      toast.error("❌ Failed to send phone OTP. Try again!");
    }
  };

  const verifyPhone = async () => {
    try {
      const response = await verifyPhoneOtp({ contact, otp: phoneOtp });
      if (response.message === "Phone verified successfully!") {
        setIsPhoneVerified(true);
        toast.success("✅ Phone verified successfully!");
      } else {
        toast.warning("⚠️ Invalid phone OTP. Try again.");
      }
    } catch (error) {
      toast.error("❌ Error verifying phone OTP.");
    }
  };

  const onSubmit = async (data) => {
    if (!isEmailVerified || !isPhoneVerified) {
      toast.warning("⚠️ Please verify both Email and Phone before signing up.");
      return;
    }

    try {
      console.log(data.role);
        await SignupUser(data);
        toast.success("🎉 Signup successful! You can now login.");
        navigate("/login");
      
    } catch (error) {
      toast.error("❌ Signup failed. Try again.");
    }
  };

  return (
    <>
      <Navbar />
      
      <section id="SignupPage" className="bg-image1">
        
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-md-10 col-lg-8 signup-card">
              <h2 className="text-center text-primary mb-4">Signup</h2>
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Account Type */}
                <div className="row mb-3">
                  <label className="col-md-3 col-form-label fw-bold">Account Type:</label>
                  <div className="col-md-3 d-flex align-items-center gap-4">
                    <div className="form-check">
                      <input
                        type="radio"
                        id="customer"
                        value="user"
                        {...register("role")}
                        className="form-check-input"
                      />
                      <label htmlFor="customer" className="form-check-label">Customer</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="radio"
                        id="service"
                        value="service"
                        {...register("role")}
                        className="form-check-input"
                      />
                      <label htmlFor="service" className="form-check-label">Service</label>
                    </div>
                  </div>
                </div>
                {/* Name Fields */}
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <input type="text" placeholder="Username" {...register("username")} className="form-control" required />
                  </div>
                  <div className="col-md-4 mb-3">
                    <input type="text" placeholder="First Name" {...register("firstname")} className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="col-md-4 mb-3">
                    <input type="text" placeholder="Last Name" {...register("lastname")} className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>

                {/* Gender */}
                <div className="mb-3">
                  <select className="form-control" {...register("gender")} value={gender} onChange={(e) => setGender(e.target.value)} required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Email OTP */}
                <div className="mb-3">
                  <input type="email" placeholder="Email" {...register("email")} className="form-control" required onChange={(e) => setEmail(e.target.value)} />
                  {!otpSentEmail ? (
                    <button type="button" onClick={requestEmail} className="btn btn-primary mt-2 w-100">Send Email OTP</button>
                  ) : (
                    <>
                      <input type="text" placeholder="Enter Email OTP" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} className="form-control mt-2" required />
                      <button type="button" onClick={verifyEmail} className="btn btn-success mt-2 w-100">Verify Email OTP</button>
                    </>
                  )}
                </div>

                {/* Address */}
                <div className="mb-3">
                  <input type="text" placeholder="Address" {...register("address")} value={address} className="form-control" onChange={(e) => setAddress(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <input type="text" placeholder="Pincode" {...register("pincode")} value={pincode} className="form-control" onChange={(e) => setPincode(e.target.value)} required />
                </div>

                {/* Country State City */}
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Select Country</label>
                    <select className="form-control" value={selectedCountry} {...register("country")} onChange={(e) => { setSelectedCountry(e.target.value); setSelectedState(""); }}>
                      <option value="">-- Select Country --</option>
                      {countryList.map((countryCode) => (
                        <option key={countryCode} value={countryCode}>{countriesData[countryCode].name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Select State</label>
                    <select className="form-control" value={selectedState} {...register("state")} onChange={(e) => setSelectedState(e.target.value)}>
                      <option value="">-- Select State --</option>
                      {stateList.map((state) => (
                        <option key={state.code} value={state.code}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Select City</label>
                    <select className="form-control" {...register("city")}>
                      <option value="">-- Select City --</option>
                      {cityList.map((city, index) => (
                        <option key={index} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phone OTP */}
                <div className="mb-3">
                  <input type="text" placeholder="Phone Number" {...register("contact")} className="form-control" required onChange={(e) => setContact(e.target.value)} />
                  {!otpSentPhone ? (
                    <button type="button" onClick={requestPhone} className="btn btn-primary mt-2 w-100">Send Phone OTP</button>
                  ) : (
                    <>
                      <input type="text" placeholder="Enter Phone OTP" value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value)} className="form-control mt-2" required />
                      <button type="button" onClick={verifyPhone} className="btn btn-success mt-2 w-100">Verify Phone OTP</button>
                    </>
                  )}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <input type="password" placeholder="Password" {...register("password")} className="form-control" required />
                </div>

                <button type="submit" className="btn btn-dark w-100">Signup</button>
              </form>
            </div>
          </div>
        </div>
        
      </section>
<div style={{height:0}}>      <ToastContainer  position="top-right" autoClose={2000} />
</div>
        <Footer />
    

    </>
  );
};

export default Signup;
