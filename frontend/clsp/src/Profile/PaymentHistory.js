import React, { useEffect, useState, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { GetPaymentInfo, DownloadPaymentReceiptPDF } from "../Services/operation/PAymentauthcall.js";

const STATUS_BADGE = {
  success: "bg-success",
  failed:  "bg-danger",
  pending: "bg-warning text-dark",
  created: "bg-secondary",
  refunded:"bg-info text-dark",
};

const PaymentHistory = () => {
  const token = localStorage.getItem("token");

  const [payments, setPayments]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  // ── Filters / search / sort ───────────────────────────────────────────────
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField]     = useState("createdAt");
  const [sortDir, setSortDir]         = useState("desc");

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage]               = useState(1);
  const PAGE_SIZE                     = 15;

  // ── Expanded row ─────────────────────────────────────────────────────────
  const [expandedId, setExpandedId]   = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await GetPaymentInfo(token);
        setPayments(data.payments || []);
      } catch (err) {
        toast.error("Failed to load payment history.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  // ── Derived list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...payments];

    // Status filter
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }

    // Search (order ID or payment ID)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.orderId?.toLowerCase().includes(q) ||
          p.paymentResponse?.razorpay_payment_id?.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let va = a[sortField];
      let vb = b[sortField];
      if (sortField === "createdAt") {
        va = new Date(va);
        vb = new Date(vb);
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [payments, statusFilter, search, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-muted ms-1">↕</span>;
    return <span className="ms-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const handleDownload = async (pmt) => {
    setDownloadingId(pmt._id);
    try {
      await DownloadPaymentReceiptPDF(pmt._id, token);
      toast.success("Receipt downloaded!");
    } catch (err) {
      toast.error("Failed to download receipt.");
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Summary stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   payments.length,
    success: payments.filter((p) => p.status === "success").length,
    failed:  payments.filter((p) => p.status === "failed").length,
    totalAmt: payments
      .filter((p) => p.status === "success")
      .reduce((s, p) => s + (p.amount || 0), 0),
  }), [payments]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
        <p className="mt-3 text-muted">Loading payment history...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 px-3">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h5 className="fw-bold mb-0">💳 Payment History</h5>
          <small className="text-muted">{stats.total} total transactions</small>
        </div>
        {/* Summary pills */}
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2">
            ✅ {stats.success} Success
          </span>
          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-2">
            ❌ {stats.failed} Failed
          </span>
          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-2">
            ₹{stats.totalAmt.toLocaleString("en-IN")} Paid
          </span>
        </div>
      </div>

      {/* ── Filters row ────────────────────────────────────────────────────── */}
      <div className="row g-2 mb-3">
        {/* Search */}
        <div className="col-12 col-sm-5 col-md-4">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="🔍 Search Order ID / Payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="col-6 col-sm-3 col-md-2">
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="created">Created</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* Sort */}
        <div className="col-6 col-sm-4 col-md-3">
          <select
            className="form-select form-select-sm"
            value={`${sortField}_${sortDir}`}
            onChange={(e) => {
              const [f, d] = e.target.value.split("_");
              setSortField(f);
              setSortDir(d);
            }}
          >
            <option value="createdAt_desc">Newest First</option>
            <option value="createdAt_asc">Oldest First</option>
            <option value="amount_desc">Amount: High → Low</option>
            <option value="amount_asc">Amount: Low → High</option>
          </select>
        </div>

        {/* Result count */}
        <div className="col-12 col-md-3 d-flex align-items-center">
          <small className="text-muted">
            Showing {paginated.length} of {filtered.length} records
          </small>
        </div>
      </div>

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1">💳</div>
          <h6 className="mt-2">No payments found</h6>
          <p className="text-muted small">Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          {/* ── Table ──────────────────────────────────────────────────────── */}
          <div className="table-responsive rounded-3 border shadow-sm">
            <table className="table table-hover table-sm mb-0 align-middle">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: 32 }}></th>
                  <th style={{ cursor: "pointer" }} onClick={() => toggleSort("createdAt")}>
                    Date <SortIcon field="createdAt" />
                  </th>
                  <th>Order ID</th>
                  <th>Payment ID</th>
                  <th style={{ cursor: "pointer" }} onClick={() => toggleSort("amount")}>
                    Amount <SortIcon field="amount" />
                  </th>
                  <th>Status</th>
                  <th>Method</th>
                  <th className="text-center">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((pmt) => (
                  <React.Fragment key={pmt._id}>
                    {/* ── Main row ─────────────────────────────────────────── */}
                    <tr
                      style={{ cursor: "pointer" }}
                      onClick={() => setExpandedId(expandedId === pmt._id ? null : pmt._id)}
                      className={expandedId === pmt._id ? "table-active" : ""}
                    >
                      <td className="text-center text-muted small">
                        {expandedId === pmt._id ? "▲" : "▼"}
                      </td>
                      <td className="small text-nowrap">
                        {new Date(pmt.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                        <br />
                        <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                          {new Date(pmt.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="small text-muted font-monospace" style={{ maxWidth: 160 }}>
                        <span
                          title={pmt.orderId}
                          style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        >
                          {pmt.orderId}
                        </span>
                      </td>
                      <td className="small text-muted font-monospace" style={{ maxWidth: 160 }}>
                        <span
                          title={pmt.paymentResponse?.razorpay_payment_id || "—"}
                          style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        >
                          {pmt.paymentResponse?.razorpay_payment_id || "—"}
                        </span>
                      </td>
                      <td className="fw-semibold text-nowrap">
                        ₹{Number(pmt.amount).toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[pmt.status] || "bg-secondary"}`}>
                          {pmt.status}
                        </span>
                      </td>
                      <td className="small text-capitalize">{pmt.paymentMethod || "card"}</td>
                      <td className="text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-outline-primary btn-sm py-0 px-2"
                          style={{ fontSize: "0.75rem" }}
                          onClick={() => handleDownload(pmt)}
                          disabled={downloadingId === pmt._id}
                          title="Download Receipt PDF"
                        >
                          {downloadingId === pmt._id ? (
                            <span className="spinner-border spinner-border-sm" />
                          ) : (
                            "⬇ PDF"
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* ── Expanded detail row ───────────────────────────────── */}
                    {expandedId === pmt._id && (
                      <tr className="table-light">
                        <td colSpan={8} className="px-4 py-3">
                          <div className="row g-3 small">
                            <div className="col-sm-6 col-md-4">
                              <div className="fw-semibold text-muted mb-1">Transaction Details</div>
                              <div><strong>Order ID:</strong> <span className="font-monospace">{pmt.orderId}</span></div>
                              <div><strong>Payment ID:</strong> <span className="font-monospace">{pmt.paymentResponse?.razorpay_payment_id || "N/A"}</span></div>
                              <div><strong>Signature:</strong> <span className="font-monospace text-muted" style={{ fontSize: "0.65rem" }}>{pmt.paymentResponse?.razorpay_signature?.slice(0, 24)}…</span></div>
                            </div>
                            <div className="col-sm-6 col-md-4">
                              <div className="fw-semibold text-muted mb-1">Payment Info</div>
                              <div><strong>Gateway:</strong> {pmt.paymentGateway || "Razorpay"}</div>
                              <div><strong>Method:</strong> {pmt.paymentMethod || "card"}</div>
                              <div><strong>Currency:</strong> {pmt.currency || "INR"}</div>
                              <div><strong>Amount:</strong> <span className="text-success fw-bold">₹{Number(pmt.amount).toLocaleString("en-IN")}</span></div>
                            </div>
                            <div className="col-sm-6 col-md-4">
                              <div className="fw-semibold text-muted mb-1">Timestamps</div>
                              <div><strong>Created:</strong> {new Date(pmt.createdAt).toLocaleString("en-IN")}</div>
                              <div><strong>Updated:</strong> {new Date(pmt.updatedAt).toLocaleString("en-IN")}</div>
                              <div className="mt-2">
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleDownload(pmt)}
                                  disabled={downloadingId === pmt._id}
                                >
                                  {downloadingId === pmt._id ? (
                                    <><span className="spinner-border spinner-border-sm me-1" />Generating...</>
                                  ) : (
                                    "⬇ Download Receipt PDF"
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ─────────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
              <small className="text-muted">
                Page {page} of {totalPages}
              </small>
              <div className="d-flex gap-1">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >«</button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >‹ Prev</button>

                {/* Page number pills */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const p = start + i;
                  return (
                    <button
                      key={p}
                      className={`btn btn-sm ${p === page ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >Next ›</button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >»</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentHistory;
