import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { fetchMyInvoices, downloadInvoicePDF } from "../../Services/operation/invoiceAuthCall";

const InvoiceList = () => {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchMyInvoices(token);
        setInvoices(res.data || []);
      } catch (err) {
        toast.error("Failed to load invoices.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const handleDownload = async (invoice) => {
    // Pass invoice._id directly — backend now looks up by invoice ID first,
    // then falls back to booking/packageBooking/historyService refs
    const refId = invoice._id;
    if (!refId) {
      toast.error("Cannot download: invoice ID missing.");
      return;
    }
    setDownloadingId(invoice._id);
    try {
      await downloadInvoicePDF(refId, token);
      toast.success("Invoice downloaded!");
    } catch (err) {
      toast.error(err?.message || "Download failed.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
        <p className="mt-3 text-muted">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-primary mb-0">🧾 My Invoices</h4>
          <small className="text-muted">GST-ready tax invoices for all your bookings</small>
        </div>
        <span className="badge bg-primary bg-opacity-10 text-primary fs-6">
          {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
        </span>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1">🧾</div>
          <h5 className="mt-2">No invoices yet</h5>
          <p className="text-muted">
            {role === "admin"
              ? "No invoices have been generated in the system yet."
              : role === "service"
              ? "Invoices will appear here after you complete service deliveries."
              : "Invoices are generated after your bookings are completed."}
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {invoices.map((inv) => (
            <div key={inv._id} className="col-12">
              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body p-4">
                  {/* Invoice header row */}
                  <div className="row align-items-center">
                    <div className="col-md-4">
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-3 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center"
                          style={{ width: 48, height: 48, flexShrink: 0 }}
                        >
                          <span className="fs-5">🧾</span>
                        </div>
                        <div>
                          <div className="fw-bold">{inv.invoiceNumber}</div>
                          <small className="text-muted">
                            {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </small>
                          {/* Show customer name for admin/service */}
                          {(role === "admin" || role === "service") && inv.user && (
                            <div className="mt-1">
                              <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                👤 {inv.user.firstname
                                  ? `${inv.user.firstname} ${inv.user.lastname || ""}`.trim()
                                  : inv.user.email || "User"}
                              </span>
                            </div>
                          )}
                          {/* Invoice type badge */}
                          <div className="mt-1">
                            <span className={`badge ${
                              inv.packageBooking ? "bg-info text-dark" :
                              inv.historyService ? "bg-success" : "bg-primary"
                            } bg-opacity-10 ${
                              inv.packageBooking ? "text-info" :
                              inv.historyService ? "text-success" : "text-primary"
                            }`}>
                              {inv.packageBooking ? "📦 Package" :
                               inv.historyService ? "✅ Service" : "📋 Booking"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-5 mt-3 mt-md-0">
                      <div className="row text-center">
                        <div className="col-4">
                          <div className="text-muted small">Sub-total</div>
                          <div className="fw-semibold">₹{inv.totalAmount?.toFixed(2)}</div>
                        </div>
                        <div className="col-4">
                          <div className="text-muted small">GST ({inv.gstPercentage}%)</div>
                          <div className="fw-semibold text-warning">₹{inv.gstAmount?.toFixed(2)}</div>
                        </div>
                        <div className="col-4">
                          <div className="text-muted small">Total</div>
                          <div className="fw-bold text-success fs-6">₹{inv.finalAmount?.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3 mt-3 mt-md-0 d-flex gap-2 justify-content-md-end">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setExpandedId(expandedId === inv._id ? null : inv._id)}
                      >
                        {expandedId === inv._id ? "▲ Hide" : "▼ Details"}
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleDownload(inv)}
                        disabled={downloadingId === inv._id}
                      >
                        {downloadingId === inv._id ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          "⬇ PDF"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded items */}
                  {expandedId === inv._id && (
                    <div className="mt-4 border-top pt-3">
                      <h6 className="fw-semibold mb-3">Invoice Items</h6>
                      <div className="table-responsive">
                        <table className="table table-sm table-borderless mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>#</th>
                              <th>Service</th>
                              <th className="text-end">Price</th>
                              <th className="text-end">Qty</th>
                              <th className="text-end">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(inv.items || []).map((item, idx) => (
                              <tr key={idx}>
                                <td className="text-muted">{idx + 1}</td>
                                <td>{item.serviceName}</td>
                                <td className="text-end">₹{item.price?.toFixed(2)}</td>
                                <td className="text-end">{item.quantity}</td>
                                <td className="text-end fw-semibold">₹{item.lineTotal?.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="border-top">
                            <tr>
                              <td colSpan={4} className="text-end text-muted">Sub-total</td>
                              <td className="text-end fw-semibold">₹{inv.totalAmount?.toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td colSpan={4} className="text-end text-muted">
                                GST ({inv.gstPercentage}%)
                              </td>
                              <td className="text-end fw-semibold text-warning">
                                ₹{inv.gstAmount?.toFixed(2)}
                              </td>
                            </tr>
                            <tr className="table-success">
                              <td colSpan={4} className="text-end fw-bold">Total Payable</td>
                              <td className="text-end fw-bold text-success">
                                ₹{inv.finalAmount?.toFixed(2)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>

                      {/* Company details */}
                      {inv.companyDetails && (
                        <div className="mt-3 p-3 bg-light rounded-3">
                          <small className="text-muted">
                            <strong>{inv.companyDetails.name}</strong>
                            {inv.companyDetails.gstin && ` · GSTIN: ${inv.companyDetails.gstin}`}
                            {inv.companyDetails.email && ` · ${inv.companyDetails.email}`}
                          </small>
                        </div>
                      )}
                    </div>
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

export default InvoiceList;
