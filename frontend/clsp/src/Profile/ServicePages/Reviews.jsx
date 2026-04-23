import React, { useEffect, useState, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getReviewByUser } from "../../Services/operation/Reviewauthcall";

// ── Read-only star display ────────────────────────────────────────────────────
const Stars = ({ rating, size = "1rem" }) => (
  <span>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} style={{ color: s <= rating ? "#f59e0b" : "#d1d5db", fontSize: size }}>★</span>
    ))}
  </span>
);

const RATING_COLORS = { 5: "success", 4: "primary", 3: "warning", 2: "orange", 1: "danger" };

const Reviews = () => {
  const token = localStorage.getItem("token");

  const [completedServices, setCompletedServices] = useState([]);
  const [fetchedReviews, setFetchedReviews]       = useState([]);
  const [loading, setLoading]                     = useState(true);

  // ── Filters ───────────────────────────────────────────────────────────────
  const [search, setSearch]             = useState("");
  const [ratingFilter, setRatingFilter] = useState("all"); // all | 5 | 4 | 3 | 2 | 1 | unreviewed
  const [sortField, setSortField]       = useState("completedAt");
  const [sortDir, setSortDir]           = useState("desc");

  // ── Expanded row ──────────────────────────────────────────────────────────
  const [expandedId, setExpandedId]     = useState(null);

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage]                 = useState(1);
  const PAGE_SIZE                       = 12;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getReviewByUser(token);
        setCompletedServices((res?.completedServices || []).flat());
        setFetchedReviews(res?.fetchedReview || []);
      } catch (err) {
        toast.error("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  // ── Derived list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...completedServices];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.serviceName?.toLowerCase().includes(q) ||
          s.serviceCategory?.toLowerCase().includes(q)
      );
    }

    if (ratingFilter === "unreviewed") {
      list = list.filter((s) => !fetchedReviews.some((r) => r.reviewCardId === s._id));
    } else if (ratingFilter !== "all") {
      const star = Number(ratingFilter);
      list = list.filter((s) => {
        const r = fetchedReviews.find((rv) => rv.reviewCardId === s._id);
        return r?.rating === star;
      });
    }

    list.sort((a, b) => {
      if (sortField === "rating") {
        const ra = fetchedReviews.find((r) => r.reviewCardId === a._id)?.rating || 0;
        const rb = fetchedReviews.find((r) => r.reviewCardId === b._id)?.rating || 0;
        return sortDir === "asc" ? ra - rb : rb - ra;
      }
      const da = new Date(a.completedAt);
      const db = new Date(b.completedAt);
      return sortDir === "desc" ? db - da : da - db;
    });

    return list;
  }, [completedServices, fetchedReviews, search, ratingFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, ratingFilter, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-muted ms-1" style={{ fontSize: "0.7rem" }}>↕</span>;
    return <span className="ms-1" style={{ fontSize: "0.7rem" }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const reviewed = fetchedReviews.length;
    const avg = reviewed
      ? (fetchedReviews.reduce((s, r) => s + r.rating, 0) / reviewed).toFixed(1)
      : "—";
    const dist = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: fetchedReviews.filter((r) => r.rating === star).length,
    }));
    return { total: completedServices.length, reviewed, avg, dist };
  }, [completedServices, fetchedReviews]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" style={{ width: "3rem", height: "3rem" }} />
        <p className="mt-3 text-muted">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-3 px-3">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h5 className="fw-bold mb-0">⭐ Customer Reviews</h5>
          <small className="text-muted">{stats.total} completed services · {stats.reviewed} reviews received</small>
        </div>
        <div className="d-flex gap-2 flex-wrap align-items-center">
          <span className="badge bg-warning bg-opacity-10 text-warning border border-warning px-3 py-2" style={{ fontSize: "1rem" }}>
            ★ {stats.avg}
          </span>
          <span className="badge bg-success bg-opacity-10 text-success border border-success px-3 py-2">
            {stats.reviewed} Reviews
          </span>
        </div>
      </div>

      {/* ── Rating distribution bar ────────────────────────────────────────── */}
      {stats.reviewed > 0 && (
        <div className="card border-0 shadow-sm mb-3 p-3">
          <div className="row g-1 align-items-center">
            {stats.dist.map(({ star, count }) => (
              <div key={star} className="col-12">
                <div className="d-flex align-items-center gap-2">
                  <span style={{ width: 24, fontSize: "0.8rem", textAlign: "right" }}>{star}★</span>
                  <div className="flex-grow-1 bg-light rounded" style={{ height: 10 }}>
                    <div
                      className={`bg-${RATING_COLORS[star] || "secondary"} rounded`}
                      style={{
                        height: 10,
                        width: stats.reviewed ? `${(count / stats.reviewed) * 100}%` : "0%",
                        transition: "width 0.4s",
                      }}
                    />
                  </div>
                  <span className="text-muted" style={{ width: 28, fontSize: "0.75rem" }}>{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-sm-5 col-md-4">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="🔍 Search service or category..."
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
            <option value="all">All Ratings</option>
            <option value="5">★★★★★ 5 Stars</option>
            <option value="4">★★★★☆ 4 Stars</option>
            <option value="3">★★★☆☆ 3 Stars</option>
            <option value="2">★★☆☆☆ 2 Stars</option>
            <option value="1">★☆☆☆☆ 1 Star</option>
            <option value="unreviewed">No Review Yet</option>
          </select>
        </div>
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
            <option value="completedAt_desc">Newest First</option>
            <option value="completedAt_asc">Oldest First</option>
            <option value="rating_desc">Rating: High → Low</option>
            <option value="rating_asc">Rating: Low → High</option>
          </select>
        </div>
        <div className="col-12 col-md-3 d-flex align-items-center">
          <small className="text-muted">
            Showing {paginated.length} of {filtered.length} records
          </small>
        </div>
      </div>

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-5">
          <div className="fs-1">⭐</div>
          <h6 className="mt-2">No reviews found</h6>
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
                  <th style={{ cursor: "pointer" }} onClick={() => toggleSort("completedAt")}>
                    Completed <SortIcon field="completedAt" />
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => toggleSort("rating")}>
                    Rating <SortIcon field="rating" />
                  </th>
                  <th>Review Title</th>
                  <th>Verified</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((service) => {
                  const review = fetchedReviews.find((r) => r.reviewCardId === service._id);
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
                        <td className="small text-nowrap text-muted">
                          {new Date(service.completedAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </td>
                        <td>
                          {review ? (
                            <Stars rating={review.rating} />
                          ) : (
                            <span className="badge bg-light text-muted border">No review</span>
                          )}
                        </td>
                        <td className="small text-muted">
                          {review?.title ? (
                            <span
                              title={review.title}
                              style={{ maxWidth: 160, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                            >
                              {review.title}
                            </span>
                          ) : "—"}
                        </td>
                        <td>
                          {review ? (
                            <span className={`badge ${review.isVerifiedCustomer ? "bg-success" : "bg-secondary"}`}>
                              {review.isVerifiedCustomer ? "✅ Verified" : "Unverified"}
                            </span>
                          ) : "—"}
                        </td>
                      </tr>

                      {/* ── Expanded detail row ────────────────────────────── */}
                      {isExpanded && (
                        <tr className="table-light">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="row g-3 small">
                              <div className="col-sm-6 col-md-4">
                                <div className="fw-semibold text-muted mb-1">Service Details</div>
                                <div><strong>Name:</strong> {service.serviceName}</div>
                                <div><strong>Description:</strong> {service.serviceDescription || "—"}</div>
                                <div><strong>Category:</strong> {service.serviceCategory}</div>
                                <div><strong>Price:</strong> ₹{service.servicePrice}</div>
                                <div><strong>Duration:</strong> {service.serviceDuration} hr</div>
                                <div><strong>Status:</strong> <span className="badge bg-success">{service.deliveryStatus}</span></div>
                              </div>
                              <div className="col-sm-6 col-md-4">
                                <div className="fw-semibold text-muted mb-1">Completion</div>
                                <div><strong>Completed:</strong> {new Date(service.completedAt).toLocaleString("en-IN")}</div>
                                {service.additionalNotes && (
                                  <div><strong>Notes:</strong> {service.additionalNotes}</div>
                                )}
                              </div>
                              <div className="col-sm-12 col-md-4">
                                <div className="fw-semibold text-muted mb-1">Customer Review</div>
                                {review ? (
                                  <>
                                    <Stars rating={review.rating} size="1.3rem" />
                                    {review.title && (
                                      <div className="fw-semibold mt-1">{review.title}</div>
                                    )}
                                    {review.comment && (
                                      <div className="text-muted mt-1 fst-italic">"{review.comment}"</div>
                                    )}
                                    <div className="mt-2 d-flex gap-2 flex-wrap">
                                      <span className={`badge ${review.isVerifiedCustomer ? "bg-success" : "bg-secondary"}`}>
                                        {review.isVerifiedCustomer ? "✅ Verified Customer" : "Unverified"}
                                      </span>
                                      <small className="text-muted">
                                        {new Date(review.createdAt).toLocaleDateString("en-IN")}
                                      </small>
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-muted mb-0">No review submitted yet.</p>
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
    </div>
  );
};

export default Reviews;
