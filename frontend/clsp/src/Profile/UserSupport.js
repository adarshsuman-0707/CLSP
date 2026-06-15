import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getUserSupportMessages,
  submitUserSupportMessage,
} from "../Services/operation/userSupportCall";

// ── Helpers ───────────────────────────────────────────────────────────────────

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

const formatDateTime = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

// ── Component ─────────────────────────────────────────────────────────────────

const UserSupport = () => {
  const token = localStorage.getItem("token");

  // List state
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Detail state
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Submit form state
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchMessages = async (currentPage) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      const res = await getUserSupportMessages(params, token);
      if (res?.success) {
        setMessages(res.data || []);
        setTotalPages(res.pages || 1);
        setTotal(res.total || 0);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to fetch support messages!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ── Select message ────────────────────────────────────────────────────────

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    setShowSubmitForm(false);
  };

  // ── Submit handler ────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitUserSupportMessage(
        { subject: subject.trim(), message: message.trim() },
        token
      );
      if (res?.success) {
        toast.success("Support message submitted successfully!");
        setSubject("");
        setMessage("");
        setShowSubmitForm(false);
        fetchMessages(1); // Refresh list
        setPage(1);
      }
    } catch (err) {
      toast.error(err?.message || err || "Failed to submit support message!");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h4 className="fw-bold text-primary mb-0">
          💬 Support Messages
          {unreadCount > 0 && (
            <span
              className="badge bg-warning text-dark ms-2 fs-6"
              title={`${unreadCount} pending message${unreadCount !== 1 ? "s" : ""}`}
            >
              {unreadCount} Pending
            </span>
          )}
        </h4>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setShowSubmitForm(true);
            setSelectedMessage(null);
          }}
        >
          ✉️ New Message
        </button>
      </div>

      {/* Two-panel layout */}
      <div className="row g-3" style={{ minHeight: "600px" }}>
        {/* ── Left panel: message list ──────────────────────────────────── */}
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom fw-semibold text-muted small py-2">
              My Messages {total > 0 && `(${total})`}
            </div>

            {loading ? (
              <div className="card-body d-flex flex-column align-items-center justify-content-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading…</span>
                </div>
                <p className="mt-2 text-muted small">Loading messages…</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="card-body d-flex flex-column align-items-center justify-content-center py-5 text-muted">
                <div className="fs-1">📭</div>
                <p className="mt-2 small text-center">
                  No support messages yet.
                  <br />
                  Click "New Message" to submit one.
                </p>
              </div>
            ) : (
              <>
                <div
                  className="list-group list-group-flush overflow-auto"
                  style={{ maxHeight: "520px" }}
                >
                  {messages.map((msg) => {
                    const isSelected = selectedMessage?._id === msg._id;
                    const isPending = msg.status === "pending";
                    return (
                      <button
                        key={msg._id}
                        type="button"
                        className={`list-group-item list-group-item-action border-0 border-bottom px-3 py-3 text-start ${
                          isSelected ? "active" : ""
                        }`}
                        onClick={() => handleSelectMessage(msg)}
                      >
                        {/* Subject + status badge */}
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <span
                            className={`fw-semibold small text-truncate me-2 ${
                              isSelected ? "text-white" : "text-dark"
                            }`}
                            style={{ maxWidth: "180px", fontWeight: isPending ? 600 : 400 }}
                          >
                            {msg.subject || "(No subject)"}
                          </span>
                          <span
                            className={`badge ${
                              isPending ? "bg-warning text-dark" : "bg-success"
                            } flex-shrink-0`}
                          >
                            {isPending ? "Pending" : "Replied"}
                          </span>
                        </div>

                        {/* Message preview */}
                        <div
                          className={`small text-truncate mb-1 ${
                            isSelected ? "text-white-50" : "text-muted"
                          }`}
                        >
                          {msg.message?.substring(0, 50)}...
                        </div>

                        {/* Date */}
                        <div
                          className={`small ${
                            isSelected ? "text-white-50" : "text-muted"
                          }`}
                        >
                          {formatDate(msg.createdAt)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="card-footer bg-white border-top d-flex justify-content-between align-items-center py-2">
                  <span className="text-muted small">
                    Page {page} / {totalPages}
                  </span>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setPage((prev) => prev - 1)}
                      disabled={page <= 1}
                    >
                      &laquo;
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={page >= totalPages}
                    >
                      &raquo;
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Right panel: message detail OR submit form ───────────────── */}
        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm h-100">
            {showSubmitForm ? (
              /* Submit Form */
              <>
                <div className="card-header bg-white border-bottom py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0">✉️ Submit New Support Message</h6>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setShowSubmitForm(false)}
                    >
                      ✕ Close
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">Subject *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Brief description of your issue"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        maxLength={200}
                        required
                      />
                      <small className="text-muted">
                        {subject.length}/200 characters
                      </small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Message *</label>
                      <textarea
                        className="form-control"
                        rows={8}
                        placeholder="Describe your issue in detail..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        maxLength={2000}
                        required
                      />
                      <small className="text-muted">
                        {message.length}/2000 characters
                      </small>
                    </div>

                    <div className="alert alert-info small">
                      <i className="fas fa-info-circle me-2"></i>
                      Your name and email will be automatically filled from your profile.
                      Our support team will respond via email.
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={submitting || !subject.trim() || !message.trim()}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Submitting…
                        </>
                      ) : (
                        "📤 Submit Message"
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : selectedMessage ? (
              /* Message Detail */
              <>
                <div className="card-header bg-white border-bottom py-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="fw-bold mb-1">
                        {selectedMessage.subject || "(No subject)"}
                      </h6>
                      <div className="text-muted small">
                        Submitted: {formatDateTime(selectedMessage.createdAt)}
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        selectedMessage.status === "pending"
                          ? "bg-warning text-dark"
                          : "bg-success"
                      } fs-6`}
                    >
                      {selectedMessage.status === "pending" ? "Pending" : "Replied"}
                    </span>
                  </div>
                </div>

                <div className="card-body overflow-auto" style={{ maxHeight: "500px" }}>
                  {/* Your message */}
                  <div className="mb-4">
                    <h6 className="fw-semibold text-muted small mb-2">YOUR MESSAGE</h6>
                    <div
                      className="p-3 bg-light rounded"
                      style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}
                    >
                      {selectedMessage.message || (
                        <span className="text-muted fst-italic">No message content.</span>
                      )}
                    </div>
                  </div>

                  {/* Admin reply */}
                  {selectedMessage.status === "replied" && selectedMessage.replyText && (
                    <div className="mb-4">
                      <h6 className="fw-semibold text-success small mb-2">
                        ✅ ADMIN REPLY
                        {selectedMessage.repliedAt && (
                          <span className="fw-normal ms-2 text-muted">
                            — {formatDateTime(selectedMessage.repliedAt)}
                          </span>
                        )}
                      </h6>
                      <div
                        className="p-3 border border-success rounded bg-white"
                        style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}
                      >
                        {selectedMessage.replyText}
                      </div>
                    </div>
                  )}

                  {/* Pending status message */}
                  {selectedMessage.status === "pending" && (
                    <div className="alert alert-warning">
                      <i className="fas fa-clock me-2"></i>
                      Your message is pending. Our support team will respond soon via email.
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="card-body d-flex flex-column align-items-center justify-content-center py-5 text-muted">
                <div className="fs-1">📩</div>
                <p className="mt-3 text-center">
                  Select a message from the list to view details
                  <br />
                  or click "New Message" to submit a support request.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSupport;
