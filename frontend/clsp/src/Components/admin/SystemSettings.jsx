import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { getSettings, updateSettings } from "../../Services/operation/adminAuthCall";

// ── Default values (used when no settings document exists yet) ────────────────

const DEFAULT_SETTINGS = {
  commissionRate: 10,
  otpExpiryMinutes: 10,
  platformName: "CLSP Services",
  supportEmail: "",
  maintenanceMode: false,
};

// ── Validation ────────────────────────────────────────────────────────────────

const validate = (form) => {
  const errors = {};

  const commission = Number(form.commissionRate);
  if (form.commissionRate === "" || isNaN(commission)) {
    errors.commissionRate = "Commission Rate is required.";
  } else if (commission < 0 || commission > 100) {
    errors.commissionRate = "Commission Rate must be between 0 and 100.";
  }

  const otp = Number(form.otpExpiryMinutes);
  if (form.otpExpiryMinutes === "" || isNaN(otp)) {
    errors.otpExpiryMinutes = "OTP Expiry is required.";
  } else if (!Number.isInteger(otp) || otp < 1 || otp > 60) {
    errors.otpExpiryMinutes = "OTP Expiry must be a whole number between 1 and 60.";
  }

  if (!form.platformName || !form.platformName.trim()) {
    errors.platformName = "Platform Name is required.";
  }

  if (form.supportEmail && form.supportEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.supportEmail.trim())) {
      errors.supportEmail = "Please enter a valid email address.";
    }
  }

  return errors;
};

// ── Component ─────────────────────────────────────────────────────────────────

const SystemSettings = () => {
  const token = localStorage.getItem("token");

  const [form, setForm]         = useState(DEFAULT_SETTINGS);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [isDirty, setIsDirty]   = useState(false);

  // ── Fetch current settings on mount ────────────────────────────────────────

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSettings(token);
      const data = res?.data || res?.settings || res;
      if (data && typeof data === "object") {
        setForm({
          commissionRate:   data.commissionRate   ?? DEFAULT_SETTINGS.commissionRate,
          otpExpiryMinutes: data.otpExpiryMinutes ?? DEFAULT_SETTINGS.otpExpiryMinutes,
          platformName:     data.platformName     ?? DEFAULT_SETTINGS.platformName,
          supportEmail:     data.supportEmail     ?? DEFAULT_SETTINGS.supportEmail,
          maintenanceMode:  data.maintenanceMode  ?? DEFAULT_SETTINGS.maintenanceMode,
        });
      }
    } catch (err) {
      toast.error(err?.message || "Failed to load settings.");
    } finally {
      setLoading(false);
      setIsDirty(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ── Field change handler ────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setForm((prev) => ({ ...prev, [name]: newValue }));
    setIsDirty(true);

    // Clear field-level error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the validation errors before saving.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        commissionRate:   Number(form.commissionRate),
        otpExpiryMinutes: Number(form.otpExpiryMinutes),
        platformName:     form.platformName.trim(),
        supportEmail:     form.supportEmail.trim(),
        maintenanceMode:  form.maintenanceMode,
      };

      await updateSettings(payload, token);
      toast.success("Settings saved successfully!");
      setIsDirty(false);
      setErrors({});
    } catch (err) {
      toast.error(err?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" aria-label="Loading settings">
            <span className="visually-hidden">Loading…</span>
          </div>
          <p className="text-muted">Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-primary mb-0">⚙️ System Settings</h4>
        {isDirty && (
          <span className="badge bg-warning text-dark">Unsaved changes</span>
        )}
      </div>

      {/* Maintenance Mode Warning Banner */}
      {form.maintenanceMode && (
        <div
          className="alert alert-danger d-flex align-items-start gap-3 mb-4 border-2 border-danger shadow-sm"
          role="alert"
          aria-live="assertive"
        >
          <span className="fs-4 flex-shrink-0">🚨</span>
          <div>
            <h5 className="alert-heading fw-bold mb-1">Maintenance Mode is ON</h5>
            <p className="mb-0">
              The platform is currently in maintenance mode. Non-admin users will be unable to access
              the platform until maintenance mode is turned off. Make sure to disable it once
              maintenance is complete.
            </p>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3">
          <h6 className="fw-semibold text-muted mb-0">Platform Configuration</h6>
        </div>

        <div className="card-body p-4">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-4">

              {/* Commission Rate */}
              <div className="col-md-6">
                <label htmlFor="commissionRate" className="form-label fw-semibold">
                  Commission Rate (%)
                  <span className="text-danger ms-1" aria-hidden="true">*</span>
                </label>
                <div className="input-group">
                  <input
                    id="commissionRate"
                    type="number"
                    name="commissionRate"
                    className={`form-control ${errors.commissionRate ? "is-invalid" : ""}`}
                    value={form.commissionRate}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="e.g. 10"
                    aria-describedby="commissionRateHelp commissionRateError"
                    required
                  />
                  <span className="input-group-text">%</span>
                  {errors.commissionRate && (
                    <div id="commissionRateError" className="invalid-feedback">
                      {errors.commissionRate}
                    </div>
                  )}
                </div>
                <div id="commissionRateHelp" className="form-text text-muted">
                  Percentage of each successful payment retained by the platform (0–100).
                </div>
              </div>

              {/* OTP Expiry Minutes */}
              <div className="col-md-6">
                <label htmlFor="otpExpiryMinutes" className="form-label fw-semibold">
                  OTP Expiry Duration (minutes)
                  <span className="text-danger ms-1" aria-hidden="true">*</span>
                </label>
                <div className="input-group">
                  <input
                    id="otpExpiryMinutes"
                    type="number"
                    name="otpExpiryMinutes"
                    className={`form-control ${errors.otpExpiryMinutes ? "is-invalid" : ""}`}
                    value={form.otpExpiryMinutes}
                    onChange={handleChange}
                    min="1"
                    max="60"
                    step="1"
                    placeholder="e.g. 10"
                    aria-describedby="otpExpiryHelp otpExpiryError"
                    required
                  />
                  <span className="input-group-text">min</span>
                  {errors.otpExpiryMinutes && (
                    <div id="otpExpiryError" className="invalid-feedback">
                      {errors.otpExpiryMinutes}
                    </div>
                  )}
                </div>
                <div id="otpExpiryHelp" className="form-text text-muted">
                  How long an OTP remains valid before expiring (1–60 minutes).
                </div>
              </div>

              {/* Platform Name */}
              <div className="col-md-6">
                <label htmlFor="platformName" className="form-label fw-semibold">
                  Platform Name
                  <span className="text-danger ms-1" aria-hidden="true">*</span>
                </label>
                <input
                  id="platformName"
                  type="text"
                  name="platformName"
                  className={`form-control ${errors.platformName ? "is-invalid" : ""}`}
                  value={form.platformName}
                  onChange={handleChange}
                  placeholder="e.g. CLSP Services"
                  maxLength={100}
                  aria-describedby="platformNameError"
                  required
                />
                {errors.platformName && (
                  <div id="platformNameError" className="invalid-feedback">
                    {errors.platformName}
                  </div>
                )}
                <div className="form-text text-muted">
                  Displayed in emails and platform-wide communications.
                </div>
              </div>

              {/* Support Email */}
              <div className="col-md-6">
                <label htmlFor="supportEmail" className="form-label fw-semibold">
                  Support Email
                </label>
                <input
                  id="supportEmail"
                  type="email"
                  name="supportEmail"
                  className={`form-control ${errors.supportEmail ? "is-invalid" : ""}`}
                  value={form.supportEmail}
                  onChange={handleChange}
                  placeholder="e.g. support@clsp.com"
                  aria-describedby="supportEmailHelp supportEmailError"
                />
                {errors.supportEmail && (
                  <div id="supportEmailError" className="invalid-feedback">
                    {errors.supportEmail}
                  </div>
                )}
                <div id="supportEmailHelp" className="form-text text-muted">
                  Contact email shown to users for support queries (optional).
                </div>
              </div>

              {/* Maintenance Mode Toggle */}
              <div className="col-12">
                <div className={`card border-2 ${form.maintenanceMode ? "border-danger bg-danger bg-opacity-10" : "border-secondary"}`}>
                  <div className="card-body d-flex align-items-center justify-content-between gap-3 py-3">
                    <div>
                      <h6 className={`fw-semibold mb-1 ${form.maintenanceMode ? "text-danger" : ""}`}>
                        {form.maintenanceMode ? "🔴" : "🟢"} Maintenance Mode
                      </h6>
                      <p className="text-muted small mb-0">
                        When enabled, non-admin users will see a maintenance page and cannot access the platform.
                      </p>
                    </div>
                    <div className="form-check form-switch flex-shrink-0" style={{ transform: "scale(1.4)", transformOrigin: "right center" }}>
                      <input
                        id="maintenanceMode"
                        type="checkbox"
                        name="maintenanceMode"
                        className="form-check-input"
                        role="switch"
                        checked={form.maintenanceMode}
                        onChange={handleChange}
                        aria-label="Toggle maintenance mode"
                        aria-describedby="maintenanceModeDesc"
                      />
                    </div>
                  </div>
                  {form.maintenanceMode && (
                    <div id="maintenanceModeDesc" className="card-footer bg-danger bg-opacity-10 border-top border-danger text-danger small fw-semibold py-2">
                      ⚠️ Platform is currently inaccessible to non-admin users.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Form Actions */}
            <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={fetchSettings}
                disabled={saving || loading}
                aria-label="Reset form to last saved values"
              >
                ↺ Reset
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={saving}
                aria-label="Save system settings"
              >
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving…
                  </>
                ) : (
                  "💾 Save Settings"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Info note */}
      <div className="mt-3 text-muted small text-center">
        <span>💡 Settings are applied platform-wide immediately after saving.</span>
      </div>
    </div>
  );
};

export default SystemSettings;
