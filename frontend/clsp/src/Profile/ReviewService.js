import React, { useState, useEffect, useMemo } from "react";
import { addreview, getReviewDetails } from "../Services/operation/Reviewauthcall";
import { fetchHistoryDelivered } from "../Services/operation/HistoryauthCall";
import { NotificationAdd } from "../Services/operation/Notification";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ── Star display (read-only) ──────────────────────────────────────────────────
const Stars = ({ rating, size = "1rem" }) => (
  <span>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} style={{ color: s <= rating ? "#f59e0b" : "#d1d5db", fontSize: size }}>★</span>
    ))}
  </span>
);

// ── Star picker (interactive) ─────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="d-flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          style={{
            cursor: "pointer",
            fontSize: "1.8rem",
            color: s <= (hovered || value) ? "#f59e0b" : "#d1d5db",
            transition: "color 0.15s",
          }}
        >★</span>
      ))}
    </div>
  );
};

const ReviewService = () => {
  const [history, setHistory]           = useState([]);
  const [reviews, setReviews]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search, setSearch]             = useState("");
  const [ratingFilter, setRatingFilter] = useState("all"); // all | reviewed | unreviewed
  const [sortDir, setSortDir]           = useState("desc");

  // ── Expanded row ──────────────────────────────────────────────────────────
  const [expandedId, setExpandedId]     = useState(null);

  // ── Review form state ─────────────────────────────────────────────────────
  const [formService, setFormService]   = useState(null); // service being reviewed
  const [rating, setRating]             = useState(0);
  const [title, setTitle]               = useState("");
  const [comment, setComment]           = useState("");

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage]                 = useState(1);
  const PAGE_SIZE                       = 12;

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const [histRes, revRes] = await Promise.all([
          fetchHistoryDelivered(token),
          getReviewDetails(token),
        ]);
        setHistory(histRes.completedServices || []);
        setReviews(revRes.reviews || []);
      } catch (err) {
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...history];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.serviceName?.toLowerCase().includes(q) ||
          s.serviceCategory?.toLowerCase().includes(q) ||
          s.servicemanName?.toLowerCase().includes(q)
      );
    }

    if (ratingFilter === "reviewed") {
      list = list.filter((s) => reviews.some((r) => r.reviewCardId === s._id));
    } else if (ratingFilter === "unreviewed") {
      list = list.filter((s) => !reviews.some((r) => r.reviewCardId === s._id));
    }

    list.sort((a, b) => {
      const da = new Date(a.completedAt);
      const db = new Date(b.completedAt);
      return sortDir === "desc" ? db - da : da - db;
    });

    return list;
  }, [history, reviews, search, ratingFilter, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, ratingFilter, sortDir]);

  // ── Open review form ──────────────────────────────────────────────────────
  const openForm = (service) => {
    const existing = reviews.find((r) => r.reviewCardId === service._id);
    setFormService(service);
    setRating(existing?.rating || 0);
    setTitle(existing?.title || "");
    setComment(existing?.comment || "");
  };

  const closeForm = () => {
    setFormService(null);
    setRating(0);
    setTitle("");
    setComment("");
  };

  const handleSubmit = async () => {
    if (!rating) { toast.warning("Please select a star rating."); return; }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await addreview(token, {
        serviceId: formService.ServiceID,
        rating,
        title,
        comment,
        reviewCardId: formService._id,
      });
      await NotificationAdd(token, { type: "review", title: "Review", message: "Review submitted successfully" });
      const res = await getReviewDetails(token);
      setReviews(res.reviews || []);
      toast.success("Review submitted!");
      closeForm();
    } catch (err) {
      toast.error(err?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const reviewed = history.filter((s) => reviews.some((r) => r.reviewCardId === s._id));
    const avgRating = reviewed.length
      ? (reviewed.reduce((sum, s) => {
          const r = reviews.find((rv) => rv.reviewCardId === s._id);
          return sum + (r?.rating || 0);
        }, 0) / reviewed.length).toFixed(1)
      : "—";
    return { total: history.length, reviewed: reviewed.length, avgRating };
  }, [history, reviews]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" style={{ width: "3rem", height: "3rem" }} />
        <p className="mt-3 text-muted">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 px-3">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h5 className="fw-bold mb-0">⭐ My Reviews</h5>
          <small className="text-muted">{stats.total} completed services</small>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2">
            ✅ {stats.reviewed} Reviewed
          </span>
          <span className="badge bg-warning bg-opacity-10 text-warning border border-warning px-3 py-2">
            ⏳ {stats.total - stats.reviewed} Pending
          </span>
          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-2">
            ★ Avg {stats.avgRating}
          </span>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-sm-5 col-md-4">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="🔍 Search service, category, serviceman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-6 col-sm-3 col-md-2">
          <select
            className="form-select form-select-sm"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="all">All Services</option>
            <option value="reviewed">Reviewed</option>
            <option value="unreviewed">Not Reviewed</option>
          </select>
        </div>
        <div className="col-6 col-sm-3 col-md-2">
          <select
            className="form-select form-select-sm"
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
        <div className="col-12 col-md-4 d-flex align-items-center">
          <small className="text-muted">
            Showing {paginated.length} of {filtered.length} records
          </small>
        </div>
      </div>

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1">⭐</div>
          <h6 className="mt-2">No services found</h6>
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
                  <th>Service</th>
                  <th>Category</th>
                  <th>Serviceman</th>
                  <th>Price</th>
                  <th>Completed</th>
                  <th>Your Rating</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((service) => {
                  const review = reviews.find((r) => r.reviewCardId === service._id);
                  const isExpanded = expandedId === service._id;

                  return (
                    <React.Fragment key={service._id}>
                      {/* ── Main row ───────────────────────────────────────── */}
                      <tr
                        style={{ cursor: "pointer" }}
                        onClick={() => setExpandedId(isExpanded ? null : service._id)}
                        className={isExpanded ? "table-active" : ""}
                      >
                        <td className="text-center text-muted small">
                          {isExpanded ? "▲" : "▼"}
                        </td>
                        <td className="fw-semibold small">{service.serviceName}</td>
                        <td className="small text-muted">{service.serviceCategory}</td>
                        <td className="small">{service.servicemanName}</td>
                        <td className="small text-nowrap">₹{service.servicePrice}</td>
                        <td className="small text-nowrap text-muted">
                          {new Date(service.completedAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </td>
                        <td>
                          {review ? (
                            <Stars rating={review.rating} />
                          ) : (
                            <span className="badge bg-warning text-dark">Not reviewed</span>
                          )}
                        </td>
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            className={`btn btn-sm py-0 px-2 ${review ? "btn-outline-warning" : "btn-warning"}`}
                            style={{ fontSize: "0.75rem" }}
                            onClick={() => openForm(service)}
                          >
                            {review ? "✏️ Edit" : "⭐ Review"}
                          </button>
                        </td>
                      </tr>

                      {/* ── Expanded detail row ────────────────────────────── */}
                      {isExpanded && (
                        <tr className="table-light">
                          <td colSpan={8} className="px-4 py-3">
                            <div className="row g-3 small">
                              <div className="col-sm-6 col-md-4">
                                <div className="fw-semibold text-muted mb-1">Service Details</div>
                                <div><strong>Name:</strong> {service.serviceName}</div>
                                <div><strong>Description:</strong> {service.serviceDescription || "—"}</div>
                                <div><strong>Duration:</strong> {service.serviceDuration} hr</div>
                                <div><strong>Price:</strong> ₹{service.servicePrice}</div>
                                <div><strong>Status:</strong> <span className="badge bg-success">{service.deliveryStatus}</span></div>
                              </div>
                              <div className="col-sm-6 col-md-4">
                                <div className="fw-semibold text-muted mb-1">Serviceman</div>
                                <div><strong>Name:</strong> {service.servicemanName}</div>
                                <div><strong>Completed:</strong> {new Date(service.completedAt).toLocaleString("en-IN")}</div>
                              </div>
                              <div className="col-sm-12 col-md-4">
                                <div className="fw-semibold text-muted mb-1">Your Review</div>
                                {review ? (
                                  <>
                                    <Stars rating={review.rating} size="1.2rem" />
                                    {review.title && <div className="fw-semibold mt-1">{review.title}</div>}
                                    {review.comment && <div className="text-muted mt-1">"{review.comment}"</div>}
                                    <small className="text-secondary">
                                      Submitted: {new Date(review.createdAt).toLocaleDateString("en-IN")}
                                    </small>
                                    <div className="mt-2">
                                      <button
                                        className="btn btn-outline-warning btn-sm"
                                        onClick={() => openForm(service)}
                                      >
                                        ✏️ Edit Review
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-muted mb-2">You haven't reviewed this service yet.</p>
                                    <button
                                      className="btn btn-warning btn-sm"
                                      onClick={() => openForm(service)}
                                    >
                                      ⭐ Add Review
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ─────────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
              <small className="text-muted">Page {page} of {totalPages}</small>
              <div className="d-flex gap-1">
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(1)} disabled={page === 1}>«</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹ Prev</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                  const p = start + i;
                  return (
                    <button key={p} className={`btn btn-sm ${p === page ? "btn-warning" : "btn-outline-secondary"}`} onClick={() => setPage(p)}>{p}</button>
                  );
                })}
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next ›</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Review form modal ───────────────────────────────────────────────── */}
      {formService && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <div>
                    <h5 className="modal-title fw-bold">
                      {reviews.find((r) => r.reviewCardId === formService._id) ? "✏️ Edit Review" : "⭐ Add Review"}
                    </h5>
                    <small className="text-muted">{formService.serviceName}</small>
                  </div>
                  <button type="button" className="btn-close" onClick={closeForm} />
                </div>
                <div className="modal-body px-4">
                  {/* Star picker */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Rating *</label>
                    <div><StarPicker value={rating} onChange={setRating} /></div>
                  </div>
                  {/* Title */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Title (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Great service!"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  {/* Comment */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Comment (optional)</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Share your experience..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength={1000}
                    />
                    <small className="text-muted">{comment.length}/1000</small>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button className="btn btn-outline-secondary" onClick={closeForm}>Cancel</button>
                  <button
                    className="btn btn-warning px-4"
                    onClick={handleSubmit}
                    disabled={submitting || !rating}
                  >
                    {submitting ? <><span className="spinner-border spinner-border-sm me-1" />Submitting...</> : "Submit Review"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
};

export default ReviewService;
