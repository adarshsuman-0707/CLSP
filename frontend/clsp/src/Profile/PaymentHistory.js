// import React, { useEffect, useState } from "react";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import { FaRupeeSign, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

// const PaymentHistory = () => {
//   const [payments, setPayments] = useState([]);
//   const [loading, setLoading] = useState(true);
// let token=localStorage.getItem('token')
//   const fetchPayments = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/payment/GetPaymentinfo", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setPayments(data.payments || []);
//     } catch (err) {
//       console.error("Error fetching payments:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     AOS.init({ duration: 800, easing: "ease-in-out", once: true });
//     fetchPayments();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-[80vh] text-lg font-semibold text-gray-500">
//         Loading payments...
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
//         <br></br>
//         <br></br>
//         <br></br>
//       <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
//         💳 Payment History
//       </h1>

//       {payments.length === 0 ? (
//         <div className="text-center text-gray-600 mt-20 text-lg">
//           No payments found yet.
//         </div>
//       ) : (
//         <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
//           {payments.map((pmt, index) => (
//             <div
//               key={pmt._id}
//               data-aos="fade-up"
//               data-aos-delay={index * 100}
//               className={`bg-white rounded-xl p-5 border-4 ${
//                 pmt.status === "success" ? "border-green-500" : "border-red-500"
//               } shadow-md`}
//             >
//               {/* Header */}
//               <div className="flex justify-between items-center mb-3">
//                 <h2 className="font-semibold text-gray-700">
//                   {pmt.paymentGateway}
//                 </h2>
//                 {pmt.status === "success" ? (
//                   <FaCheckCircle className="text-green-500" />
//                 ) : (
//                   <FaTimesCircle className="text-red-500" />
//                 )}
//               </div>

//               {/* Payment Info */}
//               <div className="text-gray-600 text-sm space-y-1 mb-3">
//                 <p>
//                   <span className="font-medium">Order ID:</span> {pmt.orderId}
//                 </p>
//                 <p>
//                   <span className="font-medium">Payment ID:</span>{" "}
//                   {pmt.paymentResponse?.razorpay_payment_id}
//                 </p>
//                 <p>
//                   <span className="font-medium">User:</span> {pmt.user?.email}
//                 </p>
//                 <p>
//                   <span className="font-medium">Currency:</span> {pmt.currency}
//                 </p>
//               </div>

//               {/* Amount & Date */}
//               <div className="flex justify-between items-center">
//                 <div className="text-gray-800 font-bold text-xl flex items-center">
//                   <FaRupeeSign className="mr-1 text-green-600" />
//                   {pmt.amount}
//                 </div>
//                 <div className="text-xs text-gray-500">
//                   {new Date(pmt.createdAt).toLocaleString()}
//                 </div>
//               </div>

//               {/* Status Badge */}
//               <div
//                 className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-semibold ${
//                   pmt.status === "success"
//                     ? "bg-green-100 text-green-700"
//                     : "bg-red-100 text-red-700"
//                 }`}
//               >
//                 {pmt.status.toUpperCase()}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default PaymentHistory;
import React, { useEffect, useState } from "react";
import { FaRupeeSign, FaCheckCircle, FaTimesCircle, FaHistory, FaSpinner } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import {GetPaymentInfo} from '../Services/operation/PAymentauthcall.js'
const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  let token = localStorage.getItem('token');

  const fetchPayments = async () => {
    try {
      
      const data = await GetPaymentInfo(token);
      setPayments(data.payments || []);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-secondary">
        <FaSpinner className="spinner-border text-primary mb-3" style={{ fontSize: "3rem" }} />
        <h5>Loading your payment history...</h5>
      </div>
    );
  }

  return (
    <div className="container py-5 fade-in">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-3" style={{ width: "70px", height: "70px" }}>
          <FaHistory className="text-primary fs-3" />
        </div>
        <h1 className="fw-bold mb-2">💳 Payment History</h1>
        <p className="text-muted">
          View your transaction details, including successful payments and any issues encountered.
        </p>
      </div>

      {/* No Payments */}
      {payments.length === 0 ? (
        <div className="text-center py-5">
          <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-3" style={{ width: "80px", height: "80px" }}>
            <FaHistory className="text-muted fs-2" />
          </div>
          <h4 className="fw-semibold">No Payments Found</h4>
          <p className="text-muted">Your payment history is empty. Make your first purchase to see transactions here.</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="card mb-4 shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="card-title fw-bold mb-2">Transaction Summary</h5>
              <p className="card-text mb-0">
                Total Payments: <span className="fw-bold text-primary">{payments.length}</span> |{" "}
                Successful: <span className="fw-bold text-success">{payments.filter(p => p.status === 'success').length}</span> |{" "}
                Failed: <span className="fw-bold text-danger">{payments.filter(p => p.status !== 'success').length}</span>
              </p>
            </div>
          </div>

          {/* Payment Cards */}
          <div className="row g-4">
            {payments.map((pmt, index) => (
              <div key={pmt._id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                <div className={`card h-100 shadow-sm border-2 ${pmt.status === "success" ? "border-success bg-success bg-opacity-10" : "border-danger bg-danger bg-opacity-10"}`}>
                  <div className="card-body d-flex flex-column">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="fw-semibold mb-0">{pmt.paymentGateway}</h6>
                      <div className={`rounded-circle p-2 ${pmt.status === "success" ? "bg-success text-white" : "bg-danger text-white"}`}>
                        {pmt.status === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
                      </div>
                    </div>

                    {/* Payment Info */}
                    <ul className="list-unstyled mb-3 small text-muted">
                      <li><strong>Order ID:</strong> {pmt.orderId}</li>
                      <li><strong>Payment ID:</strong> {pmt.paymentResponse?.razorpay_payment_id || "N/A"}</li>
                      <li><strong>User:</strong> {pmt.user?.email || "N/A"}</li>
                      <li><strong>Currency:</strong> {pmt.currency || "INR"}</li>
                    </ul>

                    {/* Amount & Date */}
                    <div className="d-flex justify-content-between align-items-center mt-auto border-top pt-2">
                      <div className="fw-bold text-dark fs-5 d-flex align-items-center">
                        <FaRupeeSign className="me-1 text-success" /> {pmt.amount?.toLocaleString("en-IN") || pmt.amount}
                      </div>
                      <small className="text-muted text-end">
                        {new Date(pmt.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </small>
                    </div>

                    {/* Status Badge */}
                    <div className={`badge mt-3 ${pmt.status === "success" ? "bg-success text-white" : "bg-danger text-white"}`}>
                      {pmt.status === "success" ? (
                        <><FaCheckCircle className="me-1" /> Success</>
                      ) : (
                        <><FaTimesCircle className="me-1" /> Failed</>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentHistory;
