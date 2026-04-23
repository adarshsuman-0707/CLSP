import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  getSupportMessages,
  replyToMessage,
} from "../../Services/operation/adminAuthCall";

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

const SupportMessages = () => {
  const token = localStorage.getItem("token");

  // List state
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Detail / reply state
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────

  const fetchMessages = async (currentPage) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 10 };
      const res = await getSupportMessages(params, token);
      if (res?.success) {
        setMessages(res.data || []);
        setTotalPages(res.pages || 1);
        setTotal(res.total || 0);
        // Backend returns unreadCount (count of pending messages)
        if (typeof res.unreadCount === "number") {
          setUnreadCount(res.unreadCount);
        } else {
          // Derive locally if backend doesn't return it
          const pending = (res.data || []).filter(
            (m) => m.status === "pending"
          ).length;
          setUnreadCount(pending);
        }
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
    setReplyText("");
  };

  // ── Reply handler ─────────────────────────────────────────────────────────

  const handleSendReply = async () => {
    if (!selectedMessage) return;
    if (!replyText.trim()) {
      toast.error("Reply text cannot be empty.");
      return;
    }

    setReplying(true);
    try {
      const res = await replyToMessage(selectedMessage._id, replyText.trim(), token);
      if (res?.success) {
        toast.success("Reply sent successfully!");

        // Update the selected message in local state
        const updatedMsg = {
          ...selectedMessage,
          status: "replied",
          replyText: replyText.trim(),
          repliedAt: new Date().toISOString(),
        };
        setSelectedMessage(updatedMsg);
        setReplyText("");

        // Refresh the list to reflect status change
        fetchMessages(page);
      }
    } catch (err) {
      // Req 9.5: email failure → error toast, status stays pending
      toast.error(
        err?.message ||
          (typeof err === "string" ? err : null) ||
          "Failed to send reply. Message status remains pending."
      );
    } finally {
      setReplying(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="container-fluid py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-primary mb-0">
          💬 Support Messages
          {unreadCount > 0 && (
            <span
              className="badge bg-danger ms-2 fs-6"
              title={`${unreadCount} pending message${unreadCount !== 1 ? "s" : ""}`}
              aria-label={`${unreadCount} unread messages`}
            >
              {unreadCount}
            </span>
          )}
        </h4>
        {total > 0 && (
          <span className="badge bg-secondary fs-6">{total} total</span>
        )}
      </div>

      {/* Two-panel layout */}
      <div className="row g-3" style={{ minHeight: "600px" }}>
        {/* ── Left panel: message list ──────────────────────────────────── */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom fw-semibold text-muted small py-2">
              Inbox
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
                <p className="mt-2 small">No support messages found.</p>
              </div>
            ) : (
              <>
                <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: "520px" }}>
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
                        aria-pressed={isSelected}
                      >
                        {/* Sender name + status badge */}
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <span
                            className={`fw-semibold small text-truncate me-2 ${
                              isSelected ? "text-white" : "text-dark"
                            }`}
                            style={{ maxWidth: "140px" }}
                          >
                            {msg.senderName || "—"}
                          </span>
                          <span
                            className={`badge ${
                              isPending ? "bg-warning text-dark" : "bg-success"
                            } flex-shrink-0`}
                          >
                            {isPending ? "Pending" : "Replied"}
                          </span>
                        </div>

                        {/* Subject */}
                        <div
                          className={`small text-truncate mb-1 ${
                            isSelected ? "text-white" : "text-dark"
                          }`}
                          style={{ fontWeight: isPending ? 600 : 400 }}
                        >
                          {msg.subject || "(No subject)"}
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
                      aria-label="Previous page"
                    >
                      &laquo;
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setPage((prev) => prev + 1)}
                      disabled={page >= totalPages}
                      aria-label="Next page"
                    >
                      &raquo;
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Right panel: message detail + reply ──────────────────────── */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm h-100">
            {selectedMessage ? (
              <>
                <div className="card-header bg-white border-bottom py-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="fw-bold mb-1">
                        {selectedMessage.subject || "(No subject)"}
                      </h6>
                      <div className="text-muted small">
                        From:{" "}
                        <strong>{selectedMessage.senderName || "—"}</strong>
                        {selectedMessage.senderEmail && (
                          <> &lt;{selectedMessage.senderEmail}&gt;</>
                        )}
                      </div>
                      <div className="text-muted small">
                        Received: {formatDateTime(selectedMessage.createdAt)}
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

                <div className="card-body overflow-auto" style={{ maxHeight: "360px" }}>
                  {/* Full message content */}
                  <div className="mb-4">
                    <h6 className="fw-semibold text-muted small mb-2">MESSAGE</h6>
                    <div
                      className="p-3 bg-light rounded"
                      style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}
                    >
                      {selectedMessage.message || (
                        <span className="text-muted fst-italic">
                          No message content.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Previous reply (if already replied) */}
                  {selectedMessage.status === "replied" &&
                    selectedMessage.replyText && (
                      <div className="mb-4">
                        <h6 className="fw-semibold text-muted small mb-2">
                          PREVIOUS REPLY
                          {selectedMessage.repliedAt && (
                            <span className="fw-normal ms-2">
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

                  {/* Reply form */}
                  <div>
                    <h6 className="fw-semibold text-muted small mb-2">
                      {selectedMessage.status === "replied"
                        ? "SEND ANOTHER REPLY"
                        : "REPLY"}
                    </h6>
                    <textarea
                      className="form-control mb-3"
                      rows={4}
                      placeholder="Type your reply here…"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      disabled={replying}
                      aria-label="Reply text"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleSendReply}
                      disabled={replying || !replyText.trim()}
                      aria-label="Send reply"
                    >
                      {replying ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Sending…
                        </>
                      ) : (
                        "✉ Send Reply"
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Empty state — no message selected */
              <div className="card-body d-flex flex-column align-items-center justify-content-center py-5 text-muted">
                <div className="fs-1">📩</div>
                <p className="mt-3 text-center">
                  Select a message from the inbox to view its content and reply.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportMessages;
