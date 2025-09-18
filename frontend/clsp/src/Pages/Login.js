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
const navigate=useNavigate()
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await LoginUser({
        email,
        password,
      });
      console.log(response);

      if (response.message === "Login Succesfully") {
        localStorage.setItem("isLogin",true)
        localStorage.setItem("token",response.token)
        localStorage.setItem("serviceID",response.userData._id)
         localStorage.setItem("role",response.userData.role)
        navigate('/')

        toast.success("✅ Login Successful!", { autoClose: 2000 });
      } else {
        toast.error("❌ Invalid Credentials. Try Again!", { autoClose: 2000 });
      }
    } catch (error) {
      toast.error("❌ Login Failed! Please check your details.", { autoClose: 2000 });
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
