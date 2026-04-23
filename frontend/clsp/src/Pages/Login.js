import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { LoginUser } from "../Services/operation/authcall.js";
import { NavLink, useNavigate } from "react-router-dom";
import Navbar from "./Navbars.js";
import '../Pages/Stylesheet/Login.css'
import Footer from "./Footer.js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
const navigate=useNavigate()
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await LoginUser({ email, password });

      if (response.message === "Login Succesfully") {
        localStorage.setItem("isLogin", true);
        localStorage.setItem("token", response.token);
        localStorage.setItem("serviceID", response.userData._id);
        localStorage.setItem("role", response.userData.role);
        navigate("/");
        toast.success("✅ Login Successful!", { autoClose: 2000 });
      } else {
        toast.error("❌ Invalid Credentials. Try Again!", { autoClose: 2000 });
      }
    } catch (error) {
      const code = error?.code;
      const msg  = error?.message;

      if (code === "ACCOUNT_BLOCKED") {
        toast.error("🚫 Your account has been suspended by the admin. Contact support.", { autoClose: 5000 });
      } else if (code === "PENDING_APPROVAL") {
        toast.warn("⏳ Your vendor account is pending admin approval. Please wait.", { autoClose: 5000 });
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
//   <> 
//    <Navbar/>
//     <div className="container-fluid d-flex  justify-content-center align-items-center vh-100 bg-image1">
//       <div className="card p-4  boxShadow" style={{ width: "400px",height:"350px" }}>
//         <h3 className="text-center mb-3">Login</h3>
//         <form onSubmit={handleLogin}>
//           <div className="mb-3">
//             <label>Email</label>
//             <input
//               type="email"
//               className="form-control"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div className="mb-3">
//             <label>Password</label>
//             <input
//               type="password"
//               className="form-control"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//           <button type="submit" className="btn btn-primary w-100">Login</button>
//         </form>
// <br></br>

//         <div className="d-flex justify-content-between Linkpass"><div > don't have any account ? <NavLink className=" text-decoration-none text-danger" to='/signup'>signup</NavLink>
//          </div> <NavLink className=" text-decoration-none " to='/forgot'>Forgot Password</NavLink></div>

//       </div>

//       {/* Toast Container for Notifications */}
//       <ToastContainer />
//     </div>
//     <Footer/></>
<>
  <Navbar />

  {loading && (
    <div className="Loading">
    <div id="wifi-loader">
    <svg class="circle-outer" viewBox="0 0 86 86">
        <circle class="back" cx="43" cy="43" r="40"></circle>
        <circle class="front" cx="43" cy="43" r="40"></circle>
        <circle class="new" cx="43" cy="43" r="40"></circle>
    </svg>
    <svg class="circle-middle" viewBox="0 0 60 60">
        <circle class="back" cx="30" cy="30" r="27"></circle>
        <circle class="front" cx="30" cy="30" r="27"></circle>
    </svg>
    <svg class="circle-inner" viewBox="0 0 34 34">
        <circle class="back" cx="17" cy="17" r="14"></circle>
        <circle class="front" cx="17" cy="17" r="14"></circle>
    </svg>
    <div class="text" data-text="Connecting"></div>
</div></div>
  )}
  <section className="login-wrapper d-flex justify-content-center bg-image1">
    <div className="login-form-container fade-in">
      <h3 className="text-center text-primary mb-4">Login</h3>

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" className="btn btn-dark w-100 mt-2">Login</button>
      </form>

      <div className="d-flex justify-content-between mt-3 small-links">
        <span>Don’t have an account? <NavLink to="/signup" className="text-danger text-decoration-none">Signup</NavLink></span>
        <NavLink to="/forgot" className="text-secondary text-decoration-none">Forgot Password?</NavLink>
      </div>
    </div>

    <ToastContainer />
  </section>

  <Footer />
</>

  );
};

export default Login;
