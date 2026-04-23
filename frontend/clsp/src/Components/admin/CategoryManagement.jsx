import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../Services/operation/adminAuthCall";

const CategoryManagement = () => {
  const token = localStorage.getItem("token");

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add category form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [adding, setAdding] = useState(false);

  // Inline edit state — tracks which category is being edited
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete loading state per category id
  const [deletingId, setDeletingId] = useState(null);

  // ─── Fetch ────────────────────────────────────────────────────────────────

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategories(token);
      if (res?.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to fetch categories!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Add Category ─────────────────────────────────────────────────────────

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      toast.error("Category name cannot be empty.");
      return;
    }
    setAdding(true);
    try {
      const res = await createCategory({ name: trimmed }, token);
      if (res?.success) {
        toast.success(`Category "${trimmed}" created successfully!`);
        setNewCategoryName("");
        fetchCategories();
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to create category!");
    } finally {
      setAdding(false);
    }
  };

  // ─── Inline Edit ──────────────────────────────────────────────────────────

  const startEdit = (category) => {
    setEditingId(category._id);
    setEditingName(category.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleSaveEdit = async (categoryId) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      toast.error("Category name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const res = await updateCategory(categoryId, { name: trimmed }, token);
      if (res?.success) {
        toast.success("Category renamed successfully!");
        setEditingId(null);
        setEditingName("");
        fetchCategories();
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to update category!");
    } finally {
      setSaving(false);
    }
  };

  const handleEditKeyDown = (e, categoryId) => {
    if (e.key === "Enter") handleSaveEdit(categoryId);
    if (e.key === "Escape") cancelEdit();
  };

  // ─── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = async (category) => {
    const serviceCount = category.serviceCount ?? 0;

    if (serviceCount > 0) {
      toast.error(
        `Cannot delete "${category.name}" — ${serviceCount} service${serviceCount > 1 ? "s" : ""} use this category. Reassign or delete them first.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete category "${category.name}"?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(category._id);
    try {
      const res = await deleteCategory(category._id, token);
      if (res?.success) {
        toast.success(`Category "${category.name}" deleted successfully!`);
        fetchCategories();
      }
    } catch (err) {
      // Backend may also return the guard error — surface it
      toast.error(err?.message || err || "Failed to delete category!");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-primary mb-0">🏷️ Category Management</h4>
      </div>

      {/* Add Category Form */}
      <div className="card shadow-sm mb-4">
        <div className="card-header bg-light fw-semibold">Add New Category</div>
        <div className="card-body">
          <form onSubmit={handleAddCategory} className="row g-2 align-items-end">
            <div className="col-md-6">
              <label className="form-label small text-muted mb-1">Category Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Plumbing, Carpentry..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                disabled={adding}
                maxLength={100}
              />
            </div>
            <div className="col-auto">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={adding || !newCategoryName.trim()}
              >
                {adding ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Adding...
                  </>
                ) : (
                  "+ Add Category"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <div className="fs-1">🏷️</div>
          <p className="mt-2">No categories found. Add one above.</p>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-header bg-light fw-semibold">
            All Categories ({categories.length})
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Category Name</th>
                  <th>Services</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => {
                  const isEditing = editingId === cat._id;
                  const isDeleting = deletingId === cat._id;
                  const serviceCount = cat.serviceCount ?? 0;

                  return (
                    <tr key={cat._id}>
                      {/* Index */}
                      <td className="text-muted small">{index + 1}</td>

                      {/* Category Name — inline editable */}
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            style={{ maxWidth: "260px" }}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => handleEditKeyDown(e, cat._id)}
                            autoFocus
                            maxLength={100}
                            disabled={saving}
                          />
                        ) : (
                          <span
                            className="fw-semibold"
                            title="Click Edit to rename"
                          >
                            {cat.name}
                          </span>
                        )}
                      </td>

                      {/* Service count badge */}
                      <td>
                        {serviceCount > 0 ? (
                          <span className="badge bg-info text-dark">
                            {serviceCount} service{serviceCount > 1 ? "s" : ""}
                          </span>
                        ) : (
                          <span className="badge bg-secondary">0 services</span>
                        )}
                      </td>

                      {/* Created date */}
                      <td className="text-muted small">
                        {cat.createdAt
                          ? new Date(cat.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          {isEditing ? (
                            <>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleSaveEdit(cat._id)}
                                disabled={saving || !editingName.trim()}
                              >
                                {saving ? (
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  "Save"
                                )}
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={cancelEdit}
                                disabled={saving}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => startEdit(cat)}
                                disabled={isDeleting}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(cat)}
                                disabled={isDeleting}
                                title={
                                  serviceCount > 0
                                    ? `Cannot delete — ${serviceCount} service(s) use this category`
                                    : "Delete category"
                                }
                              >
                                {isDeleting ? (
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  "Delete"
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
