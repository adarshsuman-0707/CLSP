import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { fetchMyPackageBookings } from "../../Services/operation/packageAuthCall";
import { UserPaymentCreation, UserPaymentVerify } from "../../Services/operation/PAymentauthcall";

const STATUS_COLORS = {
  Pending: "warning",
  Confirmed: "success",
  Cancelled: "danger",
  Completed: "primary",
};

const MyPackageBookings = ({ onNavigate }) => {
  const token = localStorage.getItem("token");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  const loadBookings = async () => {
    try {
      const res = await fetchMyPackageBookings(token);
      setBookings(res.data || []);
    } catch (err) {
      toast.error("Failed to load package bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePayNow = async (booking) => {
    setPayingId(booking._id);
    try {
      // Amount in paise for Razorpay
      const amountInPaise = booking.amountPaid * 100;
      const orderData = await UserPaymentCreation(amountInPaise, token);

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CLSP Services",
        description: `Package: ${booking.package?.name || "Service Package"}`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            // userId is NOT passed from frontend — backend reads it from the auth token
            const verifyResponse = await UserPaymentVerify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageBookingId: booking._id,
              token,
              amount: booking.amountPaid,
            });

            if (verifyResponse.success) {
              toast.success("✅ Payment successful! Invoice generated.");
              loadBookings(); // Refresh to show updated status
            } else {
              toast.error("❌ Payment verification failed!");
            }
          } catch (err) {
            console.error("Verify error:", err);
            toast.error(
              typeof err === "string" ? err : err?.message || "Payment verification error!"
            );
          } finally {
            setPayingId(null);
          }
        },
        prefill: {
          name: "Customer",
        },
        theme: { color: "#0d6efd" },
        modal: {
          ondismiss: function () {
            setPayingId(null);
          },
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error("Payment init error:", err);
      toast.error("Failed to initiate payment. Please try again.");
      setPayingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <h4 className="fw-bold text-primary mb-4">📋 My Package Bookings</h4>

      {bookings.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1">📦</div>
          <h5 className="mt-2">No package bookings yet</h5>
          <p className="text-muted">Browse our packages and book one today!</p>
        </div>
      ) : (
        <div className="row g-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0 rounded-4">
                <div className="card-body p-4">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold mb-0">{booking.package?.name || "Package"}</h6>
                    <span className={`badge bg-${STATUS_COLORS[booking.status] || "secondary"}`}>
                      {booking.status}
                    </span>
                  </div>

                  <p className="text-muted small mb-3">
                    {booking.package?.description?.slice(0, 80) || ""}
                  </p>

                  {/* Details */}
                  <ul className="list-unstyled small mb-3">
                    <li>
                      <strong>Scheduled:</strong>{" "}
                      {new Date(booking.scheduledDate).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </li>
                    <li>
                      <strong>Amount:</strong>{" "}
                      <span className="text-success fw-bold">₹{booking.amountPaid}</span>
                    </li>
                    <li>
                      <strong>Payment:</strong>{" "}
                      <span
                        className={`badge ${
                          booking.paymentStatus ? "bg-success" : "bg-danger"
                        }`}
                      >
                        {booking.paymentStatus ? "✅ Paid" : "❌ Pending"}
                      </span>
                    </li>
                    <li>
                      <strong>Booked On:</strong>{" "}
                      {new Date(booking.createdAt).toLocaleDateString("en-IN")}
                    </li>
                    {booking.notes && (
                      <li>
                        <strong>Notes:</strong> {booking.notes}
                      </li>
                    )}
                  </ul>

                  {/* Services included */}
                  {booking.package?.services?.length > 0 && (
                    <div className="border-top pt-2 mb-3">
                      <small className="text-muted fw-semibold">Includes:</small>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {booking.package.services.slice(0, 4).map((s) => (
                          <span key={s._id} className="badge bg-light text-dark border small">
                            {s.name}
                          </span>
                        ))}
                        {booking.package.services.length > 4 && (
                          <span className="badge bg-light text-muted border small">
                            +{booking.package.services.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {!booking.paymentStatus && booking.status !== "Cancelled" && (
                    <button
                      className="btn btn-primary w-100 btn-sm mt-2"
                      onClick={() => handlePayNow(booking)}
                      disabled={payingId === booking._id}
                    >
                      {payingId === booking._id ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" />
                          Processing...
                        </>
                      ) : (
                        `💳 Pay Now ₹${booking.amountPaid}`
                      )}
                    </button>
                  )}

                  {booking.paymentStatus && (
                    <button
                      className="btn btn-outline-success w-100 btn-sm mt-2"
                      onClick={() =>
                        onNavigate ? onNavigate("invoices") : (window.location.href = "/user/invoices")
                      }
                    >
                      🧾 View Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPackageBookings;
