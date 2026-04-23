import React, { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { getPayments, markRefunded } from "../../Services/operation/adminAuthCall";
import { endpoint } from "../../Services/api";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = ["All", "created", "pending", "success", "failed", "refunded"];

const STATUS_CARD_CONFIG = [
  { key: "created",  label: "Created",  icon: "🆕", colorClass: "border-secondary text-secondary" },
  { key: "pending",  label: "Pending",  icon: "⏳", colorClass: "border-warning  text-warning"  },
  { key: "success",  label: "Success",  icon: "✅", colorClass: "border-success  text-success"  },
  { key: "failed",   label: "Failed",   icon: "❌", colorClass: "border-danger   text-danger"   },
  { key: "refunded", label: "Refunded", icon: "↩️", colorClass: "border-info    text-info"     },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const statusBadge = (status) => {
  const map = {
    created:  "secondary",
    pending:  "warning",
    success:  "success",
    failed:   "danger",
    refunded: "info",
  };
  const color = map[status] || "secondary";
  const textClass = status === "pending" ? " text-dark" : "";
  return (
    <span className={`badge bg-${color}${textClass} text-capitalize`}>
      {status || "—"}
    </span>
  );
};

const getUserName = (payment) => {
  if (!payment.user) return "—";
  return (
    payment.user.username ||
    payment.user.email ||
    "—"
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const PaymentManagement = () => {
  const token = localStorage.getItem("token");

  const [payments, setPayments]       = useState([]);
  const [summary, setSummary]         = useState({});
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);

  // Filter
  const [statusFilter, setStatusFilter] = useState("All");

  // Refund action state
  const [refundingId, setRefundingId] = useState(null);

  // PDF download state
  const [downloadingId, setDownloadingId] = useState(null);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchPayments = async (currentPage, currentStatus) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      if (currentStatus && currentStatus !== "All") {
        params.status = currentStatus;
      }
      const res = await getPayments(params, token);
      if (res?.success) {
        setPayments(res.data || []);
        setTotalPages(res.pages || 1);
        setTotal(res.total || 0);
        setSummary(res.summary || {});
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to fetch payments!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  // ── Filter handler ────────────────────────────────────────────────────────

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleClearFilter = () => {
    setStatusFilter("All");
    setPage(1);
  };

  // ── Mark Refunded ─────────────────────────────────────────────────────────

  const handleMarkRefunded = async (payment) => {
    if (
      !window.confirm(
        `Mark payment "${payment.orderId}" as refunded?\n\nThis action cannot be undone.`
      )
    )
      return;

    setRefundingId(payment._id);
    try {
      await markRefunded(payment._id, token);
      toast.success("Payment marked as refunded!");
      fetchPayments(page, statusFilter);
    } catch (err) {
      toast.error(err?.message || err || "Failed to mark payment as refunded!");
    } finally {
      setRefundingId(null);
    }
  };

  // ── Download Receipt PDF ──────────────────────────────────────────────────

  const handleDownloadReceipt = async (paymentId, orderId) => {
    setDownloadingId(paymentId);
    try {
      const url = endpoint.PAYMENT_PDF.replace(":paymentId", paymentId);
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to download receipt");
      }

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `receipt-${orderId || paymentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      toast.success("Receipt downloaded!");
    } catch (err) {
      toast.error(err?.message || "Failed to download receipt!");
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-primary mb-0">💳 Payment Management</h4>
        {total > 0 && (
          <span className="badge bg-secondary fs-6">{total} total</span>
        )}
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────────── */}
      <div className="row g-3 mb-4">
        {STATUS_CARD_CONFIG.map(({ key, label, icon, colorClass }) => {
          const data = summary[key] || { count: 0, totalAmount: 0 };
          return (
            <div className="col-6 col-md-4 col-lg-2" key={key}>
              <div
                className={`card border-2 ${colorClass} h-100 shadow-sm`}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setStatusFilter(key);
                  setPage(1);
                }}
                title={`Filter by ${label}`}
              >
                <div className="card-body p-3 text-center">
                  <div className="fs-4 mb-1">{icon}</div>
                  <div className="fw-bold small text-uppercase text-muted">{label}</div>
                  <div className="fw-bold fs-5 mt-1">{data.count}</div>
                  <div className="small text-muted">{formatAmount(data.totalAmount)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter Row ─────────────────────────────────────────────────────── */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label fw-semibold small text-muted">
                Filter by Status
              </label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={handleStatusChange}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {statusFilter !== "All" && (
              <div className="col-md-3">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={handleClearFilter}
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Table / Loading / Empty ─────────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div className="fs-1">📭</div>
          <p className="mt-2">No payments found.</p>
          {statusFilter !== "All" && (
            <button
              className="btn btn-sm btn-outline-secondary mt-2"
              onClick={handleClearFilter}
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Order ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Gateway</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={payment._id}>
                    {/* # */}
                    <td className="text-muted small">
                      {(page - 1) * 10 + index + 1}
                    </td>

                    {/* Order ID */}
                    <td>
                      <code className="small text-muted">
                        {payment.orderId || "—"}
                      </code>
                    </td>

                    {/* User */}
                    <td>
                      <div className="fw-semibold">{getUserName(payment)}</div>
                      {payment.user?.email && payment.user?.username && (
                        <small className="text-muted">{payment.user.email}</small>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="fw-semibold text-nowrap">
                      {formatAmount(payment.amount)}
                    </td>

                    {/* Method */}
                    <td className="text-capitalize small">
                      {payment.paymentMethod || "—"}
                    </td>

                    {/* Gateway */}
                    <td className="small">
                      {payment.paymentGateway || "—"}
                    </td>

                    {/* Status */}
                    <td>{statusBadge(payment.status)}</td>

                    {/* Date */}
                    <td className="text-nowrap small text-muted">
                      {formatDate(payment.createdAt)}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        {/* Mark Refunded — only for success payments */}
                        {payment.status === "success" && (
                          <button
                            className="btn btn-sm btn-outline-warning"
                            disabled={refundingId === payment._id}
                            onClick={() => handleMarkRefunded(payment)}
                            title="Mark as Refunded"
                          >
                            {refundingId === payment._id ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-1"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Refunding…
                              </>
                            ) : (
                              "↩ Refund"
                            )}
                          </button>
                        )}

                        {/* Download Receipt */}
                        <button
                          className="btn btn-sm btn-outline-primary"
                          disabled={downloadingId === payment._id}
                          onClick={() =>
                            handleDownloadReceipt(payment._id, payment.orderId)
                          }
                          title="Download PDF Receipt"
                        >
                          {downloadingId === payment._id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Downloading…
                            </>
                          ) : (
                            "📄 Receipt"
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
    </div>
  );
};

export default PaymentManagement;
