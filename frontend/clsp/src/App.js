import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";

function App({ data }) {
  // Show toast notification when the component renders
    toast.error("❌ Failed to send email OTP. Try again!", { autoClose: 2000 });


  return (
    <div>
      <h2>App {data}</h2>
      {/* Add ToastContainer here to show notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;
