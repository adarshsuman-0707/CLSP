import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  fetchPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "../../Services/operation/packageAuthCall";
import { serviceall } from "../../Services/operation/serviceauthcall";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  discountPercentage: 0,
  serviceIds: [],
};

const AdminPackageManager = () => {
  const token = localStorage.getItem("token");

  const [packages, setPackages] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Load packages and services
  useEffect(() => {
    const load = async () => {
      try {
        const [pkgRes, svcData] = await Promise.all([
          fetchPackages(),
          serviceall(token),
        ]);
        setPackages(pkgRes.data || []);
        setAllServices(Array.isArray(svcData) ? svcData : svcData?.services || []);
      } catch (err) {
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const refreshPackages = async () => {
    const res = await fetchPackages();
    setPackages(res.data || []);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleService = (id) => {
    setForm((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id)
        ? prev.serviceIds.filter((s) => s !== id)
        : [...prev.serviceIds, id],
    }));
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (pkg) => {
    setForm({
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.price,
      discountPercentage: pkg.discountPercentage,
      serviceIds: (pkg.services || []).map((s) => s._id),
    });
    setEditingId(pkg._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.warning("Name and price are required.");
      return;
    }
    if (form.serviceIds.length === 0) {
      toast.warning("Select at least one service.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        discountPercentage: parseFloat(form.discountPercentage),
        serviceIds: form.serviceIds,
      };

      if (editingId) {
        await updatePackage(editingId, payload, token);
        toast.success("Package updated!");
      } else {
        await createPackage(payload, token);
        toast.success("Package created!");
      }
      setShowForm(false);
      await refreshPackages();
    } catch (err) {
      toast.error(err?.message || "Failed to save package.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate package "${name}"?`)) return;
    try {
      await deletePackage(id, token);
      toast.success("Package deactivated.");
      await refreshPackages();
    } catch (err) {
      toast.error(err?.message || "Failed to delete package.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2 text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-primary mb-0">🛠️ Manage Packages</h4>
        <button className="btn btn-primary" onClick={openCreate}>
          + Create Package
        </button>
      </div>

      {/* Package table */}
      {packages.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div className="fs-1">📦</div>
          <p>No packages yet. Create one!</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Final Price</th>
                <th>Services</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg._id}>
                  <td>
                    <div className="fw-semibold">{pkg.name}</div>
                    <small className="text-muted">{pkg.description?.slice(0, 50)}</small>
                  </td>
                  <td>₹{pkg.price}</td>
                  <td>
                    {pkg.discountPercentage > 0 ? (
                      <span className="badge bg-danger">{pkg.discountPercentage}%</span>
                    ) : "—"}
                  </td>
                  <td className="text-success fw-bold">₹{pkg.finalPrice}</td>
                  <td>
                    <span className="badge bg-primary bg-opacity-10 text-primary">
                      {pkg.services?.length || 0} services
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openEdit(pkg)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(pkg._id, pkg.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">
                  {editingId ? "✏️ Edit Package" : "➕ Create Package"}
                </h5>
                <button className="btn-close" onClick={() => setShowForm(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body px-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold">Package Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="e.g. Full Home Maintenance Package"
                        value={form.name}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Description</label>
                      <textarea
                        name="description"
                        className="form-control"
                        rows={2}
                        placeholder="Brief description of the package..."
                        value={form.description}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Base Price (₹) *</label>
                      <input
                        type="number"
                        name="price"
                        className="form-control"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 2999"
                        value={form.price}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        Discount: <strong>{form.discountPercentage}%</strong>
                      </label>
                      <input
                        type="range"
                        name="discountPercentage"
                        className="form-range"
                        min="0"
                        max="80"
                        value={form.discountPercentage}
                        onChange={handleFormChange}
                      />
                      {form.price && (
                        <small className="text-success">
                          Final price: ₹{(form.price - (form.price * form.discountPercentage) / 100).toFixed(2)}
                        </small>
                      )}
                    </div>

                    {/* Service selector */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Select Services * ({form.serviceIds.length} selected)
                      </label>
                      <div
                        className="border rounded-3 p-3"
                        style={{ maxHeight: "220px", overflowY: "auto" }}
                      >
                        {allServices.length === 0 ? (
                          <p className="text-muted small mb-0">No services available.</p>
                        ) : (
                          allServices.map((svc) => (
                            <div key={svc._id} className="form-check mb-2">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`svc-${svc._id}`}
                                checked={form.serviceIds.includes(svc._id)}
                                onChange={() => toggleService(svc._id)}
                              />
                              <label className="form-check-label" htmlFor={`svc-${svc._id}`}>
                                <span className="fw-semibold">{svc.name}</span>
                                <span className="badge bg-light text-dark border ms-2">{svc.category}</span>
                                <span className="text-success ms-2 small">₹{svc.price}</span>
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                    {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                    {editingId ? "Update" : "Create"} Package
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPackageManager;
