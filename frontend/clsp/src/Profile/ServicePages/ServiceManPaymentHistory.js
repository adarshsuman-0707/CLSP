import React, { useEffect, useState } from "react";
import { FaRupeeSign, FaCheckCircle, FaTimesCircle, FaHistory, FaSpinner, FaUser } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { GetPaymentInfo } from '../../Services/operation/PAymentauthcall.js';

const ServiceManPaymentHistory = () => {
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
        <h5>Loading payments received...</h5>
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
        <h1 className="fw-bold mb-2">💳 Payments Received</h1>
        <p className="text-muted">
          Here you can see all users who have made payments for your services.
        </p>
      </div>

      {/* No Payments */}
      {payments.length === 0 ? (
        <div className="text-center py-5">
          <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle mb-3" style={{ width: "80px", height: "80px" }}>
            <FaHistory className="text-muted fs-2" />
          </div>
          <h4 className="fw-semibold">No Payments Found</h4>
          <p className="text-muted">No users have made payments yet.</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="card mb-4 shadow-sm border-0">
            <div className="card-body text-center">
              <h5 className="card-title fw-bold mb-2">Transaction Summary</h5>
              <p className="card-text mb-0">
                Total Payments Received: <span className="fw-bold text-primary">{payments.length}</span> |{" "}
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

                    {/* User Info */}
                    <ul className="list-unstyled mb-3 small text-muted">
                      <li className="d-flex align-items-center">
                        <FaUser className="me-2" /> <strong>User:</strong> {pmt.user?.email || "N/A"}
                      </li>
                      <li><strong>Order ID:</strong> {pmt.orderId}</li>
                      <li><strong>Payment ID:</strong> {pmt.paymentResponse?.razorpay_payment_id || "N/A"}</li>
                      <li><strong>Payment Method:</strong> {pmt.paymentMethod || "N/A"}</li>
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

export default ServiceManPaymentHistory;
