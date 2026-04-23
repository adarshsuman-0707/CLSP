import React, { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getVendors,
  verifyVendor,
  suspendVendor,
  getVendorServices,
  updateServiceApproval,
} from "../../Services/operation/adminAuthCall";

const VendorManagement = () => {
  const token = localStorage.getItem("token");

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Services modal state
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Bootstrap modal ref
  const modalRef = useRef(null);
  const bsModalRef = useRef(null);

  const fetchVendors = async (currentPage) => {
    setLoading(true);
    try {
      const res = await getVendors({ page: currentPage, limit: 10 }, token);
      if (res?.success) {
        setVendors(res.data || []);
        setTotalPages(res.pages || 1);
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to fetch vendors!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Initialise Bootstrap modal once the DOM element is available
  useEffect(() => {
    if (modalRef.current && window.bootstrap) {
      bsModalRef.current = new window.bootstrap.Modal(modalRef.current);
    }
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleVerify = async (vendorId) => {
    const vendor = vendors.find(v => v._id === vendorId);
    const action = vendor?.isVerified ? "revoke verification for" : "verify";
    try {
      await verifyVendor(vendorId, token);
      toast.success(`Vendor ${vendor?.isVerified ? "verification revoked" : "verified"} successfully!`);
      fetchVendors(page);
    } catch (err) {
      toast.error(err?.message || err || `Failed to ${action} vendor!`);
    }
  };

  const handleSuspend = async (vendorId) => {
    const vendor = vendors.find(v => v._id === vendorId);
    const action = vendor?.isBlocked ? "unsuspend" : "suspend";
    if (!window.confirm(`Are you sure you want to ${action} this vendor?`)) return;
    try {
      await suspendVendor(vendorId, token);
      toast.success(`Vendor ${action}ed successfully!`);
      fetchVendors(page);
    } catch (err) {
      toast.error(err?.message || err || `Failed to ${action} vendor!`);
    }
  };

  const handleViewServices = async (vendor) => {
    setSelectedVendor(vendor);
    setServices([]);
    setServicesLoading(true);

    // Open modal
    if (bsModalRef.current) {
      bsModalRef.current.show();
    } else if (modalRef.current && window.bootstrap) {
      bsModalRef.current = new window.bootstrap.Modal(modalRef.current);
      bsModalRef.current.show();
    }

    try {
      const res = await getVendorServices(vendor._id, token);
      if (res?.success) {
        setServices(res.data || []);
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to fetch vendor services!");
    } finally {
      setServicesLoading(false);
    }
  };

  const handleServiceApproval = async (serviceId, status) => {
    try {
      await updateServiceApproval(serviceId, status, token);
      toast.success(
        `Service ${status === "approved" ? "approved" : "rejected"} successfully!`
      );
      // Refresh services list inside modal
      if (selectedVendor) {
        const res = await getVendorServices(selectedVendor._id, token);
        if (res?.success) {
          setServices(res.data || []);
        }
      }
      // Also refresh vendor list so badges update
      fetchVendors(page);
    } catch (err) {
      toast.error(err?.message || err || "Failed to update service approval!");
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const approvalBadge = (status) => {
    switch (status) {
      case "approved":
        return <span className="badge bg-success">Approved</span>;
      case "rejected":
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-warning text-dark">Pending</span>;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-primary mb-0">🏪 Vendor Management</h4>
      </div>

      {/* Loading spinner */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading vendors...</p>
        </div>
      ) : vendors.length === 0 ? (
        /* Empty state */
        <div className="text-center py-5 text-muted">
          <div className="fs-1">🔍</div>
          <p className="mt-2">No vendors found.</p>
        </div>
      ) : (
        <>
          {/* Vendors table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>City</th>
                  <th>Verified</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
              {console.log(vendors)}
                {vendors.map((vendor, index) => (
                  <tr key={vendor._id}>
                    <td className="text-muted small">
                      {(page - 1) * 10 + index + 1}
                    </td>
                    <td>
                      <div className="fw-semibold">{vendor.username}</div>
                      {vendor.firstname || vendor.lastname ? (
                        <small className="text-muted">
                          {[vendor.firstname, vendor.lastname]
                            .filter(Boolean)
                            .join(" ")}
                        </small>
                      ) : null}
                    </td>
                    <td>{vendor.email}</td>
                    <td>{vendor.contact || "—"}</td>
                    <td>{vendor.city || "—"}</td>
                    <td>
                      {vendor.isVerified ? (
                        <span className="badge bg-success">Verified</span>
                      ) : (
                        <span className="badge bg-warning text-dark">
                          Unverified
                        </span>
                      )}
                    </td>
                    <td>
                      {vendor.isBlocked ? (
                        <span className="badge bg-danger">Suspended</span>
                      ) : (
                        <span className="badge bg-success">Active</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        {/* Verify / Unverify toggle */}
                        <button
                          className={`btn btn-sm ${vendor.isVerified ? "btn-outline-warning" : "btn-outline-success"}`}
                          onClick={() => handleVerify(vendor._id)}
                        >
                          {vendor.isVerified ? "Unverify" : "Verify"}
                        </button>

                        {/* Suspend / Unsuspend toggle */}
                        <button
                          className={`btn btn-sm ${vendor.isBlocked ? "btn-outline-success" : "btn-outline-danger"}`}
                          onClick={() => handleSuspend(vendor._id)}
                        >
                          {vendor.isBlocked ? "Unsuspend" : "Suspend"}
                        </button>

                        {/* View Services button */}
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewServices(vendor)}
                        >
                          View Services
                        </button>
                      </div>
                    </td>
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

      {/* ── Services Modal ─────────────────────────────────────────────────── */}
      <div
        className="modal fade"
        id="vendorServicesModal"
        tabIndex="-1"
        aria-labelledby="vendorServicesModalLabel"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="vendorServicesModalLabel">
                🛠️ Services —{" "}
                {selectedVendor
                  ? selectedVendor.username ||
                    [selectedVendor.firstname, selectedVendor.lastname]
                      .filter(Boolean)
                      .join(" ")
                  : ""}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {servicesLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Loading services...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <div className="fs-2">📭</div>
                  <p className="mt-2">No services found for this vendor.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Service Name</th>
                        <th>Category</th>
                        <th>Approval Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((service, idx) => (
                        <tr key={service._id}>
                          <td className="text-muted small">{idx + 1}</td>
                          <td className="fw-semibold">
                            {service.serviceName || service.name || "—"}
                          </td>
                          <td>{service.category || "—"}</td>
                          <td>{approvalBadge(service.approvalStatus)}</td>
                          <td>
                            <div className="d-flex gap-2 flex-wrap">
                              {service.approvalStatus !== "approved" && (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() =>
                                    handleServiceApproval(
                                      service._id,
                                      "approved"
                                    )
                                  }
                                >
                                  Approve
                                </button>
                              )}
                              {service.approvalStatus !== "rejected" && (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() =>
                                    handleServiceApproval(
                                      service._id,
                                      "rejected"
                                    )
                                  }
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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

export default VendorManagement;
