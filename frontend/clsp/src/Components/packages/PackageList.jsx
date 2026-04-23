import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { fetchPackages, bookPackage } from "../../Services/operation/packageAuthCall";
import { UserPaymentCreation, UserPaymentVerify } from "../../Services/operation/PAymentauthcall";

const PackageCard = ({ pkg, onBook }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div
        className="card h-100 shadow-sm border-0 rounded-4"
        style={{ transition: "transform 0.2s" }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        <div className="card-body p-4 d-flex flex-column">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="fw-bold mb-0">{pkg.name}</h5>
            {pkg.discountPercentage > 0 && (
              <span className="badge bg-danger rounded-pill">{pkg.discountPercentage}% OFF</span>
            )}
          </div>

          <p className="text-muted small mb-3">{pkg.description || "No description provided."}</p>

          {/* Pricing */}
          <div className="mb-3">
            {pkg.discountPercentage > 0 && (
              <span className="text-muted text-decoration-line-through me-2 small">
                ₹{pkg.price}
              </span>
            )}
            <span className="fw-bold text-success fs-5">₹{pkg.finalPrice}</span>
          </div>

          {/* Services included */}
          <div className="mb-3">
            <button
              className="btn btn-sm btn-outline-secondary w-100"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "▲ Hide" : "▼ Show"} {pkg.services?.length || 0} included services
            </button>
            {expanded && (
              <ul className="list-group list-group-flush mt-2 rounded-3 border">
                {(pkg.services || []).map((svc) => (
                  <li key={svc._id} className="list-group-item d-flex justify-content-between py-2 px-3 small">
                    <span>{svc.name} <span className="badge bg-light text-dark border ms-1">{svc.category}</span></span>
                    <span className="text-success fw-semibold">₹{svc.price}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Book button */}
          <div className="mt-auto">
            <button
              className="btn btn-primary w-100 rounded-3"
              onClick={() => onBook(pkg)}
            >
              📦 Book This Package
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Booking modal
const BookingModal = ({ pkg, onClose, onConfirm, loading }) => {
  const [scheduledDate, setScheduledDate] = useState("");
  const [notes, setNotes] = useState("");

  const minDate = new Date();
  minDate.setMinutes(minDate.getMinutes() + 30);
  const minDateStr = minDate.toISOString().slice(0, 16);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!scheduledDate) {
      toast.warning("Please select a scheduled date.");
      return;
    }
    onConfirm({ scheduledDate, notes });
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">📦 Book Package</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body px-4">
              <div className="card bg-light border-0 rounded-3 p-3 mb-3">
                <div className="d-flex justify-content-between">
                  <span className="fw-semibold">{pkg.name}</span>
                  <span className="text-success fw-bold">₹{pkg.finalPrice}</span>
                </div>
                <small className="text-muted">{pkg.services?.length} services included</small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  min={minDateStr}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Notes (optional)</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Any special instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                Proceed to Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const PackageList = () => {
  const token = localStorage.getItem("token");

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingPkg, setBookingPkg] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchPackages();
        setPackages(res.data || []);
      } catch (err) {
        toast.error("Failed to load packages.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleBook = (pkg) => {
    if (!token) {
      toast.warning("Please login to book a package.");
      return;
    }
    setBookingPkg(pkg);
  };

  const handleConfirmBooking = async ({ scheduledDate, notes }) => {
    setBookingLoading(true);
    try {
      // Step 1: Create booking
      const bookingRes = await bookPackage(bookingPkg._id, { scheduledDate, notes }, token);
      const packageBookingId = bookingRes.data?.bookingId;

      if (!packageBookingId) {
        throw new Error("Booking ID not received");
      }

      // Step 2: Initiate payment
      const amount = bookingPkg.finalPrice * 100; // Convert to paise
      const orderData = await UserPaymentCreation(amount, token);

      // Step 3: Open Razorpay
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CLSP Services",
        description: `Package: ${bookingPkg.name}`,
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            const verifyResponse = await UserPaymentVerify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageBookingId: packageBookingId,
              token,
              amount: bookingPkg.finalPrice,
              // userId NOT sent — backend reads from auth token
            });

            if (verifyResponse.success) {
              toast.success(`✅ Package booked and paid successfully! Invoice generated.`);
              setBookingPkg(null);
              setTimeout(() => {
                window.location.href = "/user/invoices";
              }, 2000);
            } else {
              toast.error("❌ Payment verification failed!");
            }
          } catch (err) {
            console.error(err);
            toast.error("Payment verification error!");
          }
        },
        prefill: {
          name: "Customer",
        },
        theme: {
          color: "#0d6efd",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      toast.error(err?.message || "Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const filtered = packages.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
        <p className="mt-3 text-muted">Loading packages...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">📦 Service Packages</h2>
        <p className="text-muted">Bundled services at discounted prices — book everything you need in one go.</p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control form-control-lg rounded-3"
          placeholder="Search packages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Package grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1">📦</div>
          <h5 className="mt-2">No packages found</h5>
          <p className="text-muted">Check back later or clear your search.</p>
        </div>
      ) : (
        <div className="row">
          {filtered.map((pkg) => (
            <PackageCard key={pkg._id} pkg={pkg} onBook={handleBook} />
          ))}
        </div>
      )}

      {/* Booking modal */}
      {bookingPkg && (
        <BookingModal
          pkg={bookingPkg}
          onClose={() => setBookingPkg(null)}
          onConfirm={handleConfirmBooking}
          loading={bookingLoading}
        />
      )}
    </div>
  );
};

export default PackageList;
