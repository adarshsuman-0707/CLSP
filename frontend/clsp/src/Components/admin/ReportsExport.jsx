import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { exportCSV } from "../../Services/operation/adminAuthCall";

// ── Export Card Config ────────────────────────────────────────────────────────

const EXPORT_CARDS = [
  {
    type: "bookings",
    title: "Export Bookings CSV",
    description: "Download all booking records including booking ID, user name, vendor name, service name, date, and status.",
    icon: "📅",
    colorClass: "border-primary",
    headerClass: "bg-primary text-white",
    filename: "bookings.csv",
  },
  {
    type: "payments",
    title: "Export Payments CSV",
    description: "Download all payment records including order ID, user name, amount, currency, method, status, and date.",
    icon: "💳",
    colorClass: "border-success",
    headerClass: "bg-success text-white",
    filename: "payments.csv",
  },
  {
    type: "users",
    title: "Export Users CSV",
    description: "Download all user records including username, firstname, lastname, email, role, city, state, and contact.",
    icon: "👥",
    colorClass: "border-info",
    headerClass: "bg-info text-white",
    filename: "users.csv",
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

const ReportsExport = () => {
  const token = localStorage.getItem("token");

  // Date range state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");

  // Independent loading state per export type
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingUsers, setLoadingUsers]       = useState(false);

  // Map type → loading setter for convenience
  const loadingSetters = {
    bookings: setLoadingBookings,
    payments: setLoadingPayments,
    users:    setLoadingUsers,
  };

  const loadingStates = {
    bookings: loadingBookings,
    payments: loadingPayments,
    users:    loadingUsers,
  };

  // ── Validation ──────────────────────────────────────────────────────────────

  const validateDateRange = () => {
    if (dateFrom && dateTo) {
      if (new Date(dateFrom) > new Date(dateTo)) {
        toast.error("Start date must be before or equal to end date.");
        return false;
      }
    }
    return true;
  };

  // ── Export Handler ──────────────────────────────────────────────────────────

  const handleExport = async (type, filename) => {
    if (!validateDateRange()) return;

    const setLoading = loadingSetters[type];
    setLoading(true);

    try {
      const params = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo)   params.dateTo   = dateTo;

      const blob = await exportCSV(type, params, token);

      // Trigger browser download via blob URL
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast.success(`${filename} downloaded successfully!`);
    } catch (err) {
      toast.error(err?.message || err || `Failed to export ${type} CSV!`);
    } finally {
      setLoading(false);
    }
  };

  // ── Clear Date Range ────────────────────────────────────────────────────────

  const handleClearDates = () => {
    setDateFrom("");
    setDateTo("");
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-primary mb-0">📊 Reports &amp; Export</h4>
      </div>

      {/* Date Range Picker */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body">
          <h6 className="fw-semibold text-muted mb-3">
            📅 Filter by Date Range{" "}
            <span className="fw-normal text-muted small">(optional — leave blank to export all records)</span>
          </h6>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label htmlFor="dateFrom" className="form-label fw-semibold small text-muted">
                From Date
              </label>
              <input
                id="dateFrom"
                type="date"
                className="form-control"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="dateTo" className="form-label fw-semibold small text-muted">
                To Date
              </label>
              <input
                id="dateTo"
                type="date"
                className="form-control"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {(dateFrom || dateTo) && (
              <div className="col-md-4">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={handleClearDates}
                >
                  ✕ Clear Dates
                </button>
              </div>
            )}
          </div>

          {dateFrom && dateTo && (
            <div className="mt-2">
              <span className="badge bg-light text-dark border small">
                Exporting records from{" "}
                <strong>{new Date(dateFrom).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong>
                {" "}to{" "}
                <strong>{new Date(dateTo).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Export Cards */}
      <div className="row g-4">
        {EXPORT_CARDS.map(({ type, title, description, icon, colorClass, headerClass, filename }) => {
          const isLoading = loadingStates[type];
          return (
            <div className="col-md-4" key={type}>
              <div className={`card border-2 ${colorClass} h-100 shadow-sm`}>
                {/* Card Header */}
                <div className={`card-header ${headerClass} d-flex align-items-center gap-2`}>
                  <span className="fs-5">{icon}</span>
                  <span className="fw-semibold">{title}</span>
                </div>

                {/* Card Body */}
                <div className="card-body d-flex flex-column">
                  <p className="text-muted small flex-grow-1">{description}</p>

                  {/* Date range summary inside card */}
                  {(dateFrom || dateTo) && (
                    <div className="mb-3">
                      <span className="badge bg-light text-dark border small">
                        {dateFrom && dateTo
                          ? `${dateFrom} → ${dateTo}`
                          : dateFrom
                          ? `From ${dateFrom}`
                          : `Until ${dateTo}`}
                      </span>
                    </div>
                  )}

                  {/* Export Button */}
                  <button
                    className={`btn ${headerClass.replace("text-white", "").trim()} w-100 mt-auto`}
                    disabled={isLoading}
                    onClick={() => handleExport(type, filename)}
                    aria-label={`Download ${type} CSV`}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Exporting…
                      </>
                    ) : (
                      <>⬇ Download CSV</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info note */}
      <div className="mt-4 text-muted small text-center">
        <span>💡 CSV files can be opened in Excel, Google Sheets, or any spreadsheet application.</span>
      </div>
    </div>
  );
};

export default ReportsExport;
