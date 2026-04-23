// import React, { useState, useEffect } from "react";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { UserPaymentCreation,UserPaymentVerify } from "../Services/operation/PAymentauthcall.js"; // payment creation function
// import { fetchHistoryDelivered } from "../Services/operation/HistoryauthCall";
// function Payment() {
//   const [form, setForm] = useState({
//     name: "",
//     cardNumber: "",
//     expiry: "",
//     cvv: "",
//   });
//   let token=localStorage.getItem('token');

//   useEffect(() => {
//     AOS.init({ duration: 1000, once: true });
//   }, []);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // Razorpay Checkout handler
//   const openRazorpayCheckout = async () => {
//     try {
//       // 1️⃣ Backend se order create karna
//       const orderData = await UserPaymentCreation({ amount: 589,token }); // amount in paise

//       const options = {
//         key: orderData.key_id, // Razorpay key
//         amount: orderData.amount,
//         currency: orderData.currency,
//         name: "CLSP Digital Service",
//         description: "All Type Of HouseHold Service Available",
//         order_id: orderData.order_id,
//         handler: async function (response) {
//           // 3️⃣ Backend ko verify bhejna
//           try {
//             const verifyResponse = await UserPaymentVerify({
//               razorpay_order_id: response.razorpay_order_id,
//               razorpay_payment_id: response.razorpay_payment_id,
//               razorpay_signature: response.razorpay_signature,
//               token
//             });

//             if (verifyResponse.success) {
//               alert("Payment verified successfully!");
//               // TODO: Redirect or show success UI
//             } else {
//               alert("Payment verification failed!");
//             }
//           } catch (err) {
//             console.error(err);
//             alert("Payment verification error!");
//           }
//         },
//         prefill: {
//           name: form.name,
//         },
//         theme: {
//           color: "#0d6efd",
//         },
//       };

//       const rzp1 = new window.Razorpay(options);
//       rzp1.open();
//     } catch (err) {
//       console.error(err);
//       alert("Payment initialization failed!");
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!form.name || !form.cardNumber || !form.expiry || !form.cvv) {
//       alert("Please fill all fields");
//       return;
//     }

//     // Trigger Razorpay checkout
//     openRazorpayCheckout();
//   };

//   return (
//     <div className="container py-5">
//       <div className="row justify-content-center">
//         {/* Payment Card */}
//         <div
//           className="col-md-6 col-lg-5"
//           data-aos="fade-up"
//           data-aos-delay="100"
//         >
//           <div className="card shadow-lg border-0 rounded-4">
//             <div className="card-body p-4">
//               <h3 className="text-center mb-4 fw-bold text-primary">
//                 💳 Payment Details
//               </h3>
//               <form onSubmit={handleSubmit}>
//                 <div className="mb-3" data-aos="fade-right">
//                   <label className="form-label fw-semibold">Cardholder Name</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="John Doe"
//                     name="name"
//                     value={form.name}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>

//                 <div className="mb-3" data-aos="fade-left">
//                   <label className="form-label fw-semibold">Card Number</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="1234 5678 9012 3456"
//                     name="cardNumber"
//                     value={form.cardNumber}
//                     onChange={handleChange}
//                     required
//                   />
//                 </div>

//                 <div className="row">
//                   <div className="col-md-6 mb-3" data-aos="fade-up">
//                     <label className="form-label fw-semibold">Expiry Date</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       placeholder="MM/YY"
//                       name="expiry"
//                       value={form.expiry}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                   <div
//                     className="col-md-6 mb-3"
//                     data-aos="fade-up"
//                     data-aos-delay="100"
//                   >
//                     <label className="form-label fw-semibold">CVV</label>
//                     <input
//                       type="password"
//                       className="form-control"
//                       placeholder="123"
//                       name="cvv"
//                       value={form.cvv}
//                       onChange={handleChange}
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="d-grid mt-4" data-aos="zoom-in">
//                   <button
//                     type="submit"
//                     className="btn btn-primary btn-lg rounded-3 shadow"
//                   >
//                     Pay Now ₹589
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>

//         {/* Summary Section */}
//         <div
//           className="col-md-5 col-lg-4 mt-4 mt-md-0"
//           data-aos="fade-left"
//           data-aos-delay="200"
//         >
//           <div className="card shadow border-0 rounded-4">
//             <div className="card-body p-4">
//               <h5 className="fw-bold mb-3 text-secondary">Order Summary</h5>
//               <ul className="list-group list-group-flush">
//                 <li className="list-group-item d-flex justify-content-between">
//                   <span>Course Name</span> <strong>Digital Marketing 101</strong>
//                 </li>
//                 <li className="list-group-item d-flex justify-content-between">
//                   <span>Enrollment Fee</span> <strong>₹499</strong>
//                 </li>
//                 <li className="list-group-item d-flex justify-content-between">
//                   <span>Tax (18%)</span> <strong>₹90</strong>
//                 </li>
//                 <li className="list-group-item d-flex justify-content-between">
//                   <span>Total</span> <strong>₹589</strong>
//                 </li>
//               </ul>
//               <p className="mt-3 small text-muted text-center">
//                 100% secure payment powered by KRP Digital
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Payment;
import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  UserPaymentCreation,
  UserPaymentVerify,
} from "../Services/operation/PAymentauthcall.js";
import { fetchHistoryDelivered } from "../Services/operation/HistoryauthCall.js";
import  {NotificationAdd} from '../Services/operation/Notification.js'

function Payment() {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  let token = localStorage.getItem("token");

  // 🧩 Initialize AOS
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    fetchPendingPayments();
  }, []);

  // 📦 Fetch services with paymentStatus = false
  const fetchPendingPayments = async () => {
    try {
      const response = await fetchHistoryDelivered(token);
      console.log("Fetched Services:", response);
      if (response?.completedServices) {
        const unpaid = response.completedServices.filter(
          (s) => s.paymentStatus === false
        );
        setPendingPayments(unpaid);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🪙 Handle Razorpay Checkout
  const openRazorpayCheckout = async (amount, ServiceId) => {
    console.log(`ServiceId: ${ServiceId}, Amount: ${amount}`);
    try {
      // 1️⃣ Create order on backend
      const orderData = await UserPaymentCreation(amount, token);

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CLSP Digital Service",
        description: "Service Payment",
        order_id: orderData.order_id,
        handler: async function (response) {
          // 2️⃣ Verify payment
          try {
            const verifyResponse = await UserPaymentVerify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ServiceId,
              token,
              amount,
            });

            if (verifyResponse.success) {
              alert("✅ Payment verified successfully! Invoice generated.");
              await NotificationAdd(token, { type: "payment", title: "Payment", message: "Payment done Successfully" });
              fetchPendingPayments(); // refresh list
            } else {
              alert("❌ Payment verification failed!");
            }
          } catch (err) {
            console.error(err);
            alert("Verification error!");
          }
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
        },
        theme: {
          color: "#0d6efd",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error(err);
      alert("Payment initialization failed!");
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 fw-bold text-primary">💳 Pending Payments</h2>
      <div className="row justify-content-center">
        {pendingPayments.length === 0 ? (
          <div className="text-center text-success fw-semibold">
            🎉 All payments are completed!
          </div>
        ) : (
          pendingPayments.map((service, index) => (
            <div
              key={service._id}
              className="col-md-5 col-lg-4 mb-4"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="card shadow border-0 rounded-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold text-secondary mb-2">
                    {service.serviceName}
                  </h5>
                  <p className="mb-1">
                    <strong>Category:</strong> {service.serviceCategory}
                  </p>
                  <p className="mb-1">
                    <strong>Service By:</strong> {service.servicemanName}
                  </p>
                  <p className="mb-3">
                    <strong>Price:</strong> ₹{service.servicePrice}
                  </p>
                  <div className="d-grid">
                    <button
                      onClick={() => openRazorpayCheckout(service.servicePrice, service._id)}
                      className="btn btn-primary btn-lg rounded-3 shadow-sm"
                    >
                      Pay Now ₹{service.servicePrice}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Payment;
