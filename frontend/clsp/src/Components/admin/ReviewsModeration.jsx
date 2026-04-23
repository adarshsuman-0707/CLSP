import React, { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getReviews,
  deleteReview,
} from "../../Services/operation/adminAuthCall";

const RATING_OPTIONS = ["All", 1, 2, 3, 4, 5];

// ── Helpers ──────────────────────────────────────────────────────────────────

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

const StarDisplay = ({ rating, size = "sm" }) => {
  const filled = Math.round(rating || 0);
  return (
    <span
      className={`text-warning ${size === "lg" ? "fs-5" : "small"}`}
      aria-label={`${filled} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>{star <= filled ? "★" : "☆"}</span>
      ))}
    </span>
  );
};

const ratingBadgeColor = (rating) => {
  if (rating >= 4) return "success";
  if (rating === 3) return "warning";
  return "danger";
};

const getReviewerName = (review) => {
  if (!review.reviewer) return "—";
  return (
    review.reviewer.username ||
    [review.reviewer.firstname, review.reviewer.lastname]
      .filter(Boolean)
      .join(" ") ||
    review.reviewer.email ||
    "—"
  );
};

const getServiceName = (review) => {
  if (!review.service) return "—";
  return review.service.name || review.service.serviceName || "—";
};

const excerptComment = (comment, maxLen = 50) => {
  if (!comment) return "—";
  return comment.length > maxLen ? comment.slice(0, maxLen) + "…" : comment;
};

// ── Component ─────────────────────────────────────────────────────────────────

const ReviewsModeration = () => {
  const token = localStorage.getItem("token");

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Rating filter
  const [ratingFilter, setRatingFilter] = useState("All");

  // Full-review modal state
  const [selectedReview, setSelectedReview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Bootstrap modal ref
  const modalRef = useRef(null);
  const bsModalRef = useRef(null);

  // ── Data fetching ───────────────────────────────────────────────────────────

  const fetchReviews = async (currentPage, currentRating) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      if (currentRating !== "All") {
        params.rating = currentRating;
      }
      const res = await getReviews(params, token);
      if (res?.success) {
        setReviews(res.data || []);
        setTotalPages(res.pages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to fetch reviews!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page, ratingFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, ratingFilter]);

  // Initialise Bootstrap modal once the DOM element is available
  useEffect(() => {
    if (modalRef.current && window.bootstrap) {
      bsModalRef.current = new window.bootstrap.Modal(modalRef.current);
    }
  }, []);

  // ── Filter handler ──────────────────────────────────────────────────────────

  const handleRatingChange = (e) => {
    const val = e.target.value;
    setRatingFilter(val === "All" ? "All" : Number(val));
    setPage(1);
  };

  const handleClearFilter = () => {
    setRatingFilter("All");
    setPage(1);
  };

  // ── Modal handlers ──────────────────────────────────────────────────────────

  const handleViewFull = (review) => {
    setSelectedReview(review);
    if (bsModalRef.current) {
      bsModalRef.current.show();
    } else if (modalRef.current && window.bootstrap) {
      bsModalRef.current = new window.bootstrap.Modal(modalRef.current);
      bsModalRef.current.show();
    }
  };

  const handleCloseModal = () => {
    if (bsModalRef.current) {
      bsModalRef.current.hide();
    }
    setSelectedReview(null);
  };

  // ── Delete handler ──────────────────────────────────────────────────────────

  const handleDelete = async (reviewId, reviewerName) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently remove the review by "${reviewerName}"? This action cannot be undone.`
      )
    )
      return;

    setDeletingId(reviewId);
    try {
      await deleteReview(reviewId, token);
      toast.success("Review removed successfully!");

      // Close modal if the deleted review was open
      if (selectedReview?._id === reviewId) {
        handleCloseModal();
      }

      // If last item on page, go back one page
      if (reviews.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchReviews(page, ratingFilter);
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to remove review!");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-primary mb-0">⭐ Reviews Moderation</h4>
        {total > 0 && (
          <span className="badge bg-secondary fs-6">{total} total</span>
        )}
      </div>

      {/* Filter row */}
      <div className="card mb-4 border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            {/* Rating filter */}
            <div className="col-md-3">
              <label className="form-label fw-semibold small text-muted">
                Filter by Rating
              </label>
              <select
                className="form-select"
                value={ratingFilter}
                onChange={handleRatingChange}
              >
                {RATING_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "All" ? "All Ratings" : `${opt} Star${opt > 1 ? "s" : ""}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear filter */}
            {ratingFilter !== "All" && (
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

      {/* Loading spinner */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        /* Empty state */
        <div className="text-center py-5 text-muted">
          <div className="fs-1">📭</div>
          <p className="mt-2">No reviews found.</p>
          {ratingFilter !== "All" && (
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
          {/* Reviews table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Reviewer</th>
                  <th>Service</th>
                  <th>Rating</th>
                  <th>Title</th>
                  <th>Comment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review, index) => (
                  <tr key={review._id}>
                    <td className="text-muted small">
                      {(page - 1) * 10 + index + 1}
                    </td>

                    {/* Reviewer */}
                    <td>
                      <div className="fw-semibold">{getReviewerName(review)}</div>
                      {review.reviewer?.email && (
                        <small className="text-muted">{review.reviewer.email}</small>
                      )}
                    </td>

                    {/* Service */}
                    <td>
                      <div>{getServiceName(review)}</div>
                      {review.service?.category && (
                        <small className="text-muted">{review.service.category}</small>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="text-nowrap">
                      <span
                        className={`badge bg-${ratingBadgeColor(review.rating)} me-1`}
                      >
                        {review.rating}
                      </span>
                      <StarDisplay rating={review.rating} />
                    </td>

                    {/* Title */}
                    <td>
                      <span className="fw-semibold">
                        {review.title || <span className="text-muted fst-italic">No title</span>}
                      </span>
                    </td>

                    {/* Comment excerpt */}
                    <td>
                      <span className="text-muted small">
                        {excerptComment(review.comment)}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="text-nowrap small text-muted">
                      {formatDate(review.createdAt)}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleViewFull(review)}
                        >
                          View Full
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={deletingId === review._id}
                          onClick={() =>
                            handleDelete(review._id, getReviewerName(review))
                          }
                        >
                          {deletingId === review._id ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-1"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              Removing…
                            </>
                          ) : (
                            "Remove"
                          )}
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

      {/* ── Full Review Modal ─────────────────────────────────────────────── */}
      <div
        className="modal fade"
        id="reviewDetailModal"
        tabIndex="-1"
        aria-labelledby="reviewDetailModalLabel"
        aria-hidden="true"
        ref={modalRef}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="reviewDetailModalLabel">
                ⭐ Full Review
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={handleCloseModal}
              ></button>
            </div>

            <div className="modal-body">
              {selectedReview ? (
                <div>
                  {/* Reviewer & Service */}
                  <div className="card mb-3 border-0 bg-light">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-sm-6">
                          <span className="text-muted small d-block">Reviewer</span>
                          <div className="fw-semibold">
                            {getReviewerName(selectedReview)}
                          </div>
                          {selectedReview.reviewer?.email && (
                            <small className="text-muted">
                              {selectedReview.reviewer.email}
                            </small>
                          )}
                        </div>
                        <div className="col-sm-6">
                          <span className="text-muted small d-block">Service</span>
                          <div className="fw-semibold">
                            {getServiceName(selectedReview)}
                          </div>
                          {selectedReview.service?.category && (
                            <small className="text-muted">
                              {selectedReview.service.category}
                            </small>
                          )}
                        </div>
                        <div className="col-sm-6">
                          <span className="text-muted small d-block">Rating</span>
                          <div className="d-flex align-items-center gap-2 mt-1">
                            <span
                              className={`badge bg-${ratingBadgeColor(
                                selectedReview.rating
                              )} fs-6`}
                            >
                              {selectedReview.rating} / 5
                            </span>
                            <StarDisplay rating={selectedReview.rating} size="lg" />
                          </div>
                        </div>
                        <div className="col-sm-6">
                          <span className="text-muted small d-block">Date</span>
                          <div className="fw-semibold">
                            {formatDate(selectedReview.createdAt)}
                          </div>
                        </div>
                        {selectedReview.isVerifiedCustomer && (
                          <div className="col-12">
                            <span className="badge bg-info text-dark">
                              ✔ Verified Customer
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  {selectedReview.title && (
                    <div className="mb-3">
                      <span className="text-muted small d-block mb-1">Title</span>
                      <h6 className="fw-bold">{selectedReview.title}</h6>
                    </div>
                  )}

                  {/* Comment */}
                  <div className="mb-3">
                    <span className="text-muted small d-block mb-1">Comment</span>
                    <p className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
                      {selectedReview.comment || (
                        <span className="text-muted fst-italic">No comment provided.</span>
                      )}
                    </p>
                  </div>

                  {/* Images */}
                  {selectedReview.images && selectedReview.images.length > 0 && (
                    <div className="mb-3">
                      <span className="text-muted small d-block mb-2">
                        Images ({selectedReview.images.length})
                      </span>
                      <div className="d-flex flex-wrap gap-2">
                        {selectedReview.images.map((imgUrl, idx) => (
                          <a
                            key={idx}
                            href={imgUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Review image ${idx + 1}`}
                          >
                            <img
                              src={imgUrl}
                              alt={`Review ${idx + 1}`}
                              style={{
                                width: "120px",
                                height: "90px",
                                objectFit: "cover",
                                borderRadius: "6px",
                                border: "1px solid #dee2e6",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  <div className="fs-2">📭</div>
                  <p className="mt-2">No review selected.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedReview && (
                <button
                  className="btn btn-danger"
                  disabled={deletingId === selectedReview._id}
                  onClick={() =>
                    handleDelete(selectedReview._id, getReviewerName(selectedReview))
                  }
                >
                  {deletingId === selectedReview._id ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-1"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Removing…
                    </>
                  ) : (
                    "Remove Review"
                  )}
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseModal}
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

export default ReviewsModeration;
