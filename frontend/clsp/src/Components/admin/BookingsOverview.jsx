import React, { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getBookings,
  getBookingDetail,
} from "../../Services/operation/adminAuthCall";

const STATUS_OPTIONS = ["All", "Pending", "Confirmed", "Cancelled"];

const statusBadge = (status) => {
  switch (status) {
    case "Confirmed":
      return <span className="badge bg-success">Confirmed</span>;
    case "Cancelled":
      return <span className="badge bg-danger">Cancelled</span>;
    case "Pending":
    default:
      return <span className="badge bg-warning text-dark">Pending</span>;
  }
};

const deliveryStatusBadge = (status) => {
  if (!status) return <span className="badge bg-secondary">—</span>;
  switch (status) {
    case "Completed":
      return <span className="badge bg-success">Completed</span>;
    case "InProgress":
      return <span className="badge bg-primary">In Progress</span>;
    case "Cancelled":
      return <span className="badge bg-danger">Cancelled</span>;
    default:
      return <span className="badge bg-secondary">{status}</span>;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const BookingsOverview = () => {
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Detail modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Bootstrap modal ref
  const modalRef = useRef(null);
  const bsModalRef = useRef(null);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchBookings = async (currentPage, currentStatus, currentDateFrom, currentDateTo) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      if (currentStatus && currentStatus !== "All") {
        params.status = currentStatus;
      }
      if (currentDateFrom) params.dateFrom = currentDateFrom;
      if (currentDateTo) params.dateTo = currentDateTo;

      const res = await getBookings(params, token);
      if (res?.success) {
        setBookings(res.data || []);
        setTotalPages(res.pages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to fetch bookings!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(page, statusFilter, dateFrom, dateTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, dateFrom, dateTo]);

  // Initialise Bootstrap modal once the DOM element is available
  useEffect(() => {
    if (modalRef.current && window.bootstrap) {
      bsModalRef.current = new window.bootstrap.Modal(modalRef.current);
    }
  }, []);

  // ── Filter handlers ───────────────────────────────────────────────────────

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleDateFromChange = (e) => {
    setDateFrom(e.target.value);
    setPage(1);
  };

  const handleDateToChange = (e) => {
    setDateTo(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setStatusFilter("All");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  // ── Row click — open detail modal ─────────────────────────────────────────

  const handleRowClick = async (bookingId) => {
    setSelectedBooking(null);
    setDetailLoading(true);

    // Open modal
    if (bsModalRef.current) {
      bsModalRef.current.show();
    } else if (modalRef.current && window.bootstrap) {
      bsModalRef.current = new window.bootstrap.Modal(modalRef.current);
      bsModalRef.current.show();
    }

    try {
      const res = await getBookingDetail(bookingId, token);
      if (res?.success) {
        setSelectedBooking(res.data);
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to fetch booking details!");
      // Close modal on error
      if (bsModalRef.current) {
        bsModalRef.current.hide();
      }
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getUserName = (booking) => {
    if (!booking.userId) return "—";
    return booking.userId.username || booking.userId.email || "—";
  };

  const getVendorName = (booking) => {
    if (!booking.serviceId) return "—";
    const createdBy = booking.serviceId.createdBy;
    if (!createdBy) return "—";
    return createdBy.username || createdBy.email || "—";
  };

  const getServiceName = (booking) => {
    if (!booking.serviceId) return "—";
    return booking.serviceId.name || booking.serviceId.serviceName || "—";
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-primary mb-0">📋 Bookings Overview</h4>
        {total > 0 && (
          <span className="badge bg-secondary fs-6">{total} total</span>
        )}
      </div>

      {/* Filters row */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            {/* Status filter */}
            <div className="col-md-3">
              <label className="form-label fw-semibold small text-muted">Status</label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={handleStatusChange}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div className="col-md-3">
              <label className="form-label fw-semibold small text-muted">Date From</label>
              <input
                type="date"
                className="form-control"
                value={dateFrom}
                onChange={handleDateFromChange}
              />
            </div>

            {/* Date To */}
            <div className="col-md-3">
              <label className="form-label fw-semibold small text-muted">Date To</label>
              <input
                type="date"
                className="form-control"
                value={dateTo}
                onChange={handleDateToChange}
              />
            </div>

            {/* Clear filters */}
            <div className="col-md-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={handleClearFilters}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading spinner */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        /* Empty state */
        <div className="text-center py-5 text-muted">
          <div className="fs-1">📭</div>
          <p className="mt-2">No bookings found.</p>
          {(statusFilter !== "All" || dateFrom || dateTo) && (
            <button
              className="btn btn-sm btn-outline-secondary mt-2"
              onClick={handleClearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Bookings table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Booking ID</th>
                  <th>User</th>
                  <th>Vendor</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr
                    key={booking._id}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleRowClick(booking._id)}
                    title="Click to view details"
                  >
                    <td className="text-muted small">
                      {(page - 1) * 10 + index + 1}
                    </td>
                    <td>
                      <code className="small text-muted">
                        {booking._id?.slice(-8)?.toUpperCase()}
                      </code>
                    </td>
                    <td>
                      <div className="fw-semibold">{getUserName(booking)}</div>
                      {booking.userId?.email && (
                        <small className="text-muted">{booking.userId.email}</small>
                      )}
                    </td>
                    <td>{getVendorName(booking)}</td>
                    <td>
                      <div>{getServiceName(booking)}</div>
                      {booking.serviceId?.category && (
                        <small className="text-muted">{booking.serviceId.category}</small>
                      )}
                    </td>
                    <td className="text-nowrap">{formatDate(booking.date)}</td>
                    <td>{statusBadge(booking.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-muted small">
              Page {page} of {totalPages}
            </span>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setPage((prev) => prev - 1)}
                disabled={page <= 1}
              >
                &laquo; Prev
              </button>
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= totalPages}
              >
                Next &raquo;
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Booking Detail Modal ──────────────────────────────────────────── */}
      <div
        className="modal fade"
        id="bookingDetailModal"
        tabIndex="-1"
        aria-labelledby="bookingDetailModalLabel"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="bookingDetailModalLabel">
                📄 Booking Details
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {detailLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading booking details...</p>
                </div>
              ) : selectedBooking ? (
                <div>
                  {/* Booking Info */}
                  <div className="card mb-3 border-0 bg-light">
                    <div className="card-body">
                      <h6 className="fw-bold text-primary mb-3">🔖 Booking Information</h6>
                      <div className="row g-2">
                        <div className="col-sm-6">
                          <span className="text-muted small">Booking ID</span>
                          <div className="fw-semibold">
                            <code>{selectedBooking._id}</code>
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <span className="text-muted small">Status</span>
                          <div className="mt-1">{statusBadge(selectedBooking.status)}</div>
                        </div>
                        <div className="col-sm-6">
                          <span className="text-muted small">Booking Date</span>
                          <div className="fw-semibold">{formatDate(selectedBooking.date)}</div>
                        </div>
                        <div className="col-sm-6">
                          <span className="text-muted small">Created At</span>
                          <div className="fw-semibold">{formatDateTime(selectedBooking.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="card mb-3 border-0 bg-light">
                    <div className="card-body">
                      <h6 className="fw-bold text-primary mb-3">👤 User Information</h6>
                      {selectedBooking.userId ? (
                        <div className="row g-2">
                          <div className="col-sm-6">
                            <span className="text-muted small">Username</span>
                            <div className="fw-semibold">
                              {selectedBooking.userId.username || "—"}
                            </div>
                          </div>
                          <div className="col-sm-6">
                            <span className="text-muted small">Email</span>
                            <div className="fw-semibold">
                              {selectedBooking.userId.email || "—"}
                            </div>
                          </div>
                          {selectedBooking.userId.contact && (
                            <div className="col-sm-6">
                              <span className="text-muted small">Contact</span>
                              <div className="fw-semibold">{selectedBooking.userId.contact}</div>
                            </div>
                          )}
                          {(selectedBooking.userId.firstname || selectedBooking.userId.lastname) && (
                            <div className="col-sm-6">
                              <span className="text-muted small">Full Name</span>
                              <div className="fw-semibold">
                                {[selectedBooking.userId.firstname, selectedBooking.userId.lastname]
                                  .filter(Boolean)
                                  .join(" ")}
                              </div>
                            </div>
                          )}
                          {selectedBooking.userId.city && (
                            <div className="col-sm-6">
                              <span className="text-muted small">City</span>
                              <div className="fw-semibold">{selectedBooking.userId.city}</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted mb-0">User information not available.</p>
                      )}
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="card mb-3 border-0 bg-light">
                    <div className="card-body">
                      <h6 className="fw-bold text-primary mb-3">🛠️ Service Information</h6>
                      {selectedBooking.serviceId ? (
                        <div className="row g-2">
                          <div className="col-sm-6">
                            <span className="text-muted small">Service Name</span>
                            <div className="fw-semibold">
                              {selectedBooking.serviceId.name ||
                                selectedBooking.serviceId.serviceName ||
                                "—"}
                            </div>
                          </div>
                          {selectedBooking.serviceId.category && (
                            <div className="col-sm-6">
                              <span className="text-muted small">Category</span>
                              <div className="fw-semibold">{selectedBooking.serviceId.category}</div>
                            </div>
                          )}
                          {selectedBooking.serviceId.price !== undefined && (
                            <div className="col-sm-6">
                              <span className="text-muted small">Price</span>
                              <div className="fw-semibold">
                                ₹{selectedBooking.serviceId.price}
                              </div>
                            </div>
                          )}
                          {selectedBooking.serviceId.duration && (
                            <div className="col-sm-6">
                              <span className="text-muted small">Duration</span>
                              <div className="fw-semibold">
                                {selectedBooking.serviceId.duration} min
                              </div>
                            </div>
                          )}
                          {selectedBooking.serviceId.description && (
                            <div className="col-12">
                              <span className="text-muted small">Description</span>
                              <div className="fw-semibold">
                                {selectedBooking.serviceId.description}
                              </div>
                            </div>
                          )}
                          {/* Vendor info from service */}
                          {selectedBooking.serviceId.createdBy && (
                            <div className="col-sm-6">
                              <span className="text-muted small">Vendor</span>
                              <div className="fw-semibold">
                                {selectedBooking.serviceId.createdBy.username ||
                                  selectedBooking.serviceId.createdBy.email ||
                                  "—"}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted mb-0">Service information not available.</p>
                      )}
                    </div>
                  </div>

                  {/* Slot & Delivery Info */}
                  {(selectedBooking.slotDate ||
                    selectedBooking.slotTime ||
                    selectedBooking.serviceDeliveryStatus ||
                    selectedBooking.ServiceDeliveryStatus ||
                    (selectedBooking.serviceId?.slots &&
                      selectedBooking.serviceId.slots.length > 0)) && (
                    <div className="card mb-3 border-0 bg-light">
                      <div className="card-body">
                        <h6 className="fw-bold text-primary mb-3">📅 Slot & Delivery</h6>
                        <div className="row g-2">
                          {selectedBooking.slotDate && (
                            <div className="col-sm-6">
                              <span className="text-muted small">Slot Date</span>
                              <div className="fw-semibold">
                                {formatDate(selectedBooking.slotDate)}
                              </div>
                            </div>
                          )}
                          {selectedBooking.slotTime && (
                            <div className="col-sm-6">
                              <span className="text-muted small">Slot Time</span>
                              <div className="fw-semibold">{selectedBooking.slotTime}</div>
                            </div>
                          )}
                          {(selectedBooking.serviceDeliveryStatus ||
                            selectedBooking.ServiceDeliveryStatus) && (
                            <div className="col-sm-6">
                              <span className="text-muted small">Service Delivery Status</span>
                              <div className="mt-1">
                                {deliveryStatusBadge(
                                  selectedBooking.serviceDeliveryStatus ||
                                    selectedBooking.ServiceDeliveryStatus
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Slot info from service slots array */}
                  {selectedBooking.serviceId?.slots &&
                    selectedBooking.serviceId.slots.length > 0 && (
                      <div className="card mb-3 border-0 bg-light">
                        <div className="card-body">
                          <h6 className="fw-bold text-primary mb-3">🕐 Service Slots</h6>
                          <div className="table-responsive">
                            <table className="table table-sm table-bordered mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th>Date</th>
                                  <th>Time</th>
                                  <th>Status</th>
                                  <th>Delivery Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedBooking.serviceId.slots.map((slot, idx) => (
                                  <tr key={slot._id || idx}>
                                    <td>{formatDate(slot.date)}</td>
                                    <td>{slot.time || "—"}</td>
                                    <td>{statusBadge(slot.status)}</td>
                                    <td>
                                      {deliveryStatusBadge(
                                        slot.serviceDeliveryStatus ||
                                          slot.ServiceDeliveryStatus
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <div className="fs-2">📭</div>
                  <p className="mt-2">No booking details available.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsOverview;
