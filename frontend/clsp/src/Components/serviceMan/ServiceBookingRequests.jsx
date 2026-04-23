import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  serviceall,
  deleteSlotFromService,
  BookedRequestByUser,
  servicerUpdateBookingStatus,
  UpdateServiceValue,
  AddSlots_Service,
  DeliveryServiceStatus,
} from '../../Services/operation/serviceauthcall';
import { NotificationAdd } from '../../Services/operation/Notification';
import useSSE from '../../hooks/useSSE';

// ── Countdown hook ────────────────────────────────────────────────────────────
// Shows how long the user still has to cancel (2-min window from bookedAt).
// Returns { remaining, label } — remaining is 0 once window expires OR booking is Approved.
const CANCEL_WINDOW_MS = 2 * 60 * 1000;

const useCountdown = (bookedAt, bookingStatus) => {
  const [remaining, setRemaining] = useState(0);

  // Timer only runs while booking is still pending
  const active = bookingStatus === 'pending' && !!bookedAt;

  useEffect(() => {
    if (!active) { setRemaining(0); return; }
    const tick = () => {
      const elapsed = Date.now() - new Date(bookedAt).getTime();
      setRemaining(Math.max(0, CANCEL_WINDOW_MS - elapsed));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active, bookedAt]);

  const mins = String(Math.floor(remaining / 60000)).padStart(2, '0');
  const secs = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
  return { remaining, label: `${mins}:${secs}` };
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Approved:  'bg-success',
    Rejected:  'bg-danger',
    pending:   'bg-warning text-dark',
    completed: 'bg-primary',
    failed:    'bg-danger',
    'in-progress': 'bg-info text-dark',
  };
  return <span className={`badge ${map[status] || 'bg-secondary'}`}>{status}</span>;
};

// ── Booking request row ───────────────────────────────────────────────────────
const BookingRequestRow = ({ req, serviceId, token, onStatusChange, onDelivery, actionLoading }) => {
  const { remaining, label } = useCountdown(req.bookedAt, req.bookingStatus);

  const isPending   = req.bookingStatus === 'pending';
  const isApproved  = req.bookingStatus === 'Approved';
  const isRejected  = req.bookingStatus === 'Rejected';
  const isDone      = req.ServiceDeliveryStatus === 'completed';
  const isFailed    = req.ServiceDeliveryStatus === 'failed';
  const deliverySettled = isDone || isFailed;

  // Serviceman can accept/reject immediately — no waiting required
  // Timer only shows the user's cancel window (informational for serviceman)
  const [expanded, setExpanded] = useState(false);

  return (
    <React.Fragment>
      <tr
        style={{ cursor: 'pointer' }}
        onClick={() => setExpanded((e) => !e)}
        className={expanded ? 'table-active' : ''}
      >
        <td className="text-center text-muted small">{expanded ? '▲' : '▼'}</td>
        <td className="small text-nowrap">
          {new Date(req.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          <br />
          <span className="text-muted" style={{ fontSize: '0.7rem' }}>{req.time}</span>
        </td>
        <td className="small">
          {req.bookedBy
            ? `${req.bookedBy.firstname} ${req.bookedBy.lastname}`
            : <span className="text-muted">—</span>}
        </td>
        <td>
          <StatusBadge status={req.bookingStatus} />
          {req.ServiceDeliveryStatus !== 'pending' && (
            <span className="ms-1"><StatusBadge status={req.ServiceDeliveryStatus} /></span>
          )}
        </td>
        <td className="small">
          {/* Show cancel window countdown while pending */}
          {isPending && remaining > 0 && (
            <span className="text-warning small">⏱ User can cancel: {label}</span>
          )}
          {isPending && remaining === 0 && (
            <span className="text-muted small">Cancel window expired</span>
          )}
          {isApproved && !deliverySettled && (
            <span className="text-success small">Accepted ✅</span>
          )}
          {deliverySettled && (
            <span className={`small ${isDone ? 'text-primary' : 'text-danger'}`}>
              {isDone ? 'Completed ✅' : 'Failed ❌'}
            </span>
          )}
        </td>
        <td className="text-end" onClick={(e) => e.stopPropagation()}>
          {/* Accept / Reject — available immediately */}
          {isPending && (
            <div className="d-flex gap-1 justify-content-end">
              <button
                className="btn btn-success btn-sm py-0 px-2"
                style={{ fontSize: '0.75rem' }}
                onClick={() => onStatusChange(serviceId, req._id, 'Approved')}
                disabled={actionLoading}
              >
                ✅ Accept
              </button>
              <button
                className="btn btn-danger btn-sm py-0 px-2"
                style={{ fontSize: '0.75rem' }}
                onClick={() => onStatusChange(serviceId, req._id, 'Rejected')}
                disabled={actionLoading}
              >
                ❌ Reject
              </button>
            </div>
          )}
          {/* Mark delivery — only after Approved */}
          {isApproved && !deliverySettled && (
            <div className="d-flex gap-1 justify-content-end">
              <button
                className="btn btn-primary btn-sm py-0 px-2"
                style={{ fontSize: '0.75rem' }}
                onClick={() => onDelivery(serviceId, req._id, 'completed')}
                disabled={actionLoading}
              >
                🏁 Done
              </button>
              <button
                className="btn btn-outline-danger btn-sm py-0 px-2"
                style={{ fontSize: '0.75rem' }}
                onClick={() => onDelivery(serviceId, req._id, 'failed')}
                disabled={actionLoading}
              >
                ✖ Failed
              </button>
            </div>
          )}
          {isRejected && <span className="text-muted small">Rejected</span>}
          {deliverySettled && <span className="text-muted small">Settled</span>}
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="table-light">
          <td colSpan={6} className="px-4 py-3">
            <div className="row g-3 small">
              <div className="col-sm-6 col-md-4">
                <div className="fw-semibold text-muted mb-1">Customer Details</div>
                {req.bookedBy ? (
                  <>
                    <div><strong>Name:</strong> {req.bookedBy.firstname} {req.bookedBy.lastname}</div>
                    <div><strong>Email:</strong> {req.bookedBy.email}</div>
                    <div><strong>Phone:</strong> {req.bookedBy.phone || req.bookedBy.contact || '—'}</div>
                    <div><strong>Address:</strong> {req.bookedBy.address || '—'}</div>
                    <div><strong>Pincode:</strong> {req.bookedBy.pincode || '—'}</div>
                  </>
                ) : <span className="text-muted">No customer info</span>}
              </div>
              <div className="col-sm-6 col-md-4">
                <div className="fw-semibold text-muted mb-1">Booking Info</div>
                <div><strong>Date:</strong> {new Date(req.date).toLocaleDateString('en-IN')}</div>
                <div><strong>Time:</strong> {req.time}</div>
                <div><strong>Booked At:</strong> {req.bookedAt ? new Date(req.bookedAt).toLocaleString('en-IN') : '—'}</div>
                <div><strong>Status:</strong> <StatusBadge status={req.bookingStatus} /></div>
                <div><strong>Delivery:</strong> <StatusBadge status={req.ServiceDeliveryStatus} /></div>
              </div>
              <div className="col-sm-12 col-md-4">
                <div className="fw-semibold text-muted mb-1">Cancel Window</div>
                {isPending && remaining > 0 ? (
                  <div className="alert alert-warning py-2 px-3 mb-0 small">
                    ⏱ Customer can still cancel for <strong>{label}</strong>
                    <br />
                    <span className="text-muted">You can accept now — cancellation will be blocked once you accept.</span>
                  </div>
                ) : isPending ? (
                  <div className="alert alert-secondary py-2 px-3 mb-0 small">
                    Cancel window expired. Customer can no longer cancel.
                  </div>
                ) : isApproved ? (
                  <div className="alert alert-success py-2 px-3 mb-0 small">
                    ✅ Booking accepted. Customer cannot cancel.
                  </div>
                ) : null}
              </div>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
};

// ── Slot row (service-man view) ───────────────────────────────────────────────
const SlotRow = ({ slot, serviceId, onDelete }) => (
  <tr>
    <td className="small">
      {new Date(slot.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
    </td>
    <td className="small">{slot.time}</td>
    <td>
      <StatusBadge status={slot.bookingStatus} />
    </td>
    <td className="small">
      {slot.isBooked && slot.bookedBy
        ? `${slot.bookedBy.firstname} ${slot.bookedBy.lastname}`
        : <span className="text-muted">—</span>}
    </td>
    <td className="text-end">
      <button
        className="btn btn-outline-danger btn-sm py-0 px-2"
        style={{ fontSize: '0.75rem' }}
        onClick={() => onDelete(serviceId, slot._id)}
        disabled={slot.isBooked}
        title={slot.isBooked ? 'Cannot delete a booked slot' : 'Delete slot'}
      >
        🗑 Delete
      </button>
    </td>
  </tr>
);

// ── Main component ────────────────────────────────────────────────────────────
const ServiceBookingRequests = () => {
  const [token]    = useState(() => localStorage.getItem('token') || '');
  const providerId = localStorage.getItem('serviceID');

  const [services, setServices]           = useState([]);
  const [searchTerm, setSearchTerm]       = useState('');
  const [loading, setLoading]             = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [requestsByService, setRequestsByService] = useState({});
  const [loadedRequests, setLoadedRequests]       = useState({});

  // Modals
  const [editModal, setEditModal] = useState({ open: false, service: null });
  const [slotModal, setSlotModal] = useState({ open: false, serviceId: null });
  const [editForm, setEditForm]   = useState({ name: '', description: '', price: '', category: '', duration: '' });
  const [slotForm, setSlotForm]   = useState({ date: '', time: '' });

  // ── Fetch own services ──────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const all = await serviceall(token);
      const own = (all || []).filter(
        (s) => (s.createdBy?._id || s.createdBy)?.toString() === providerId
      );
      setServices(own);
    } catch {
      toast.error('Failed to fetch services.');
    } finally {
      setLoading(false);
    }
  }, [token, providerId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return services.filter(
      (s) => !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [services, searchTerm]);

  // ── Fetch booking requests ──────────────────────────────────────────────────
  const fetchRequests = useCallback(async (serviceId) => {
    try {
      const data = await BookedRequestByUser(serviceId, token);
      setRequestsByService((prev) => ({ ...prev, [serviceId]: data.requests || [] }));
    } catch {
      toast.error('Failed to load booking requests.');
    }
  }, [token]);

  const handleAccordionOpen = async (serviceId) => {
    if (!loadedRequests[serviceId]) {
      await fetchRequests(serviceId);
      setLoadedRequests((prev) => ({ ...prev, [serviceId]: true }));
    }
  };

  // ── Real-time updates via SSE ─────────────────────────────────────────────
  // Placed here — after fetchData and fetchRequests are both defined
  useSSE(token, useCallback((event) => {
    if (event.type === 'booking:new') {
      fetchData();
      const sid = event.payload?.serviceId;
      if (sid && loadedRequests[sid]) fetchRequests(sid);
      toast.info(`📬 New booking request for "${event.payload?.serviceName || 'a service'}"`);
    }
    if (event.type === 'booking:cancelled') {
      fetchData();
      const sid = event.payload?.serviceId;
      if (sid && loadedRequests[sid]) fetchRequests(sid);
      toast.warning('⚠️ A booking was cancelled by the user.');
    }
  }, [fetchData, fetchRequests, loadedRequests]));

  // ── Delete slot ─────────────────────────────────────────────────────────────
  const handleDeleteSlot = async (serviceId, slotId) => {
    if (!window.confirm('Delete this slot?')) return;
    setActionLoading(true);
    try {
      await deleteSlotFromService(serviceId, slotId, token);
      toast.success('Slot deleted.');
      fetchData();
    } catch {
      toast.error('Failed to delete slot.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Accept / Reject booking ─────────────────────────────────────────────────
  const handleStatusChange = async (serviceId, slotId, status) => {
    setActionLoading(true);
    try {
      await servicerUpdateBookingStatus(serviceId, slotId, token, status);
      await NotificationAdd(token, {
        type: 'service',
        title: 'Booking Update',
        message: `Booking ${status}`,
      });
      toast.success(`Booking ${status}.`);
      await fetchRequests(serviceId);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Failed to update booking.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delivery status ─────────────────────────────────────────────────────────
  const handleDelivery = async (serviceId, slotId, status) => {
    setActionLoading(true);
    try {
      await DeliveryServiceStatus(serviceId, slotId, status, token);
      await NotificationAdd(token, {
        type: 'service',
        title: 'Service Delivery',
        message: `Service marked as ${status}`,
      });
      toast.success(`Service marked as ${status}.`);
      await fetchRequests(serviceId);
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Failed to update delivery.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Edit service ────────────────────────────────────────────────────────────
  const openEditModal = (service) => {
    setEditForm({
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
      category: service.category || '',
      duration: service.duration || '',
    });
    setEditModal({ open: true, service });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await UpdateServiceValue(editModal.service._id, editForm, token);
      toast.success('Service updated.');
      setEditModal({ open: false, service: null });
      fetchData();
    } catch {
      toast.error('Failed to update service.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Add slot ────────────────────────────────────────────────────────────────
  const handleSlotSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await AddSlots_Service(slotModal.serviceId, slotForm, token);
      toast.success('Slot added.');
      setSlotModal({ open: false, serviceId: null });
      setSlotForm({ date: '', time: '' });
      fetchData();
    } catch {
      toast.error('Failed to add slot.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {(loading || actionLoading) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner-border text-light" style={{ width: '3rem', height: '3rem' }} />
        </div>
      )}

      <div className="container-fluid py-3 px-3">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-0">📋 My Services & Bookings</h5>
            <small className="text-muted">{filtered.length} service{filtered.length !== 1 ? 's' : ''}</small>
          </div>
          <button className="btn btn-outline-primary btn-sm" onClick={fetchData} disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="🔍 Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-5 text-muted">
            <div className="fs-1">🔧</div>
            <h5 className="mt-2">No services found</h5>
            <p>Add a service from the "Add Service" section.</p>
          </div>
        )}

        {/* Services accordion */}
        <div className="accordion" id="servicesAccordion">
          {filtered.map((service, index) => {
            const pendingCount = requestsByService[service._id]?.filter((r) => r.bookingStatus === 'pending').length || 0;

            return (
              <div className="accordion-item mb-3 border-0 shadow-sm rounded-4 overflow-hidden" key={service._id}>
                <h2 className="accordion-header">
                  <button
                    className="accordion-button collapsed fw-semibold"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#svc-${index}`}
                    onClick={() => handleAccordionOpen(service._id)}
                  >
                    <span className="me-2">🔧</span>
                    <span className="me-2">{service.name}</span>
                    <span className="badge bg-secondary me-1">{service.category}</span>
                    <span className="badge bg-success me-1">₹{service.price}</span>
                    <span className="badge bg-info text-dark me-1">{service.availableSlots?.length || 0} slots</span>
                    {pendingCount > 0 && (
                      <span className="badge bg-danger">{pendingCount} pending</span>
                    )}
                  </button>
                </h2>

                <div id={`svc-${index}`} className="accordion-collapse collapse">
                  <div className="accordion-body bg-white">
                    {/* Service info + actions */}
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                      <div>
                        <p className="mb-1 text-muted small">{service.description}</p>
                        <small className="text-muted">⏱ Duration: {service.duration}</small>
                      </div>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEditModal(service)}>✏️ Edit</button>
                        <button className="btn btn-sm btn-outline-success" onClick={() => setSlotModal({ open: true, serviceId: service._id })}>➕ Add Slot</button>
                      </div>
                    </div>

                    {/* ── Slots table ─────────────────────────────────────── */}
                    <h6 className="fw-semibold mb-2 border-bottom pb-1">📅 Slots</h6>
                    {!service.availableSlots?.length ? (
                      <p className="text-muted small">No slots added yet.</p>
                    ) : (
                      <div className="table-responsive rounded-3 border mb-3">
                        <table className="table table-sm table-hover mb-0 align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>Date</th>
                              <th>Time</th>
                              <th>Status</th>
                              <th>Booked By</th>
                              <th className="text-end">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {service.availableSlots.map((slot) => (
                              <SlotRow
                                key={slot._id}
                                slot={slot}
                                serviceId={service._id}
                                onDelete={handleDeleteSlot}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* ── Booking requests table ──────────────────────────── */}
                    <h6 className="fw-semibold mb-2 border-bottom pb-1">
                      📬 Booking Requests
                      {pendingCount > 0 && (
                        <span className="badge bg-danger ms-2">{pendingCount} pending</span>
                      )}
                    </h6>
                    {!requestsByService[service._id] ? (
                      <p className="text-muted small">Loading requests...</p>
                    ) : requestsByService[service._id].length === 0 ? (
                      <p className="text-muted small">No booking requests yet.</p>
                    ) : (
                      <div className="table-responsive rounded-3 border">
                        <table className="table table-sm table-hover mb-0 align-middle">
                          <thead className="table-dark">
                            <tr>
                              <th style={{ width: 32 }}></th>
                              <th>Date / Time</th>
                              <th>Customer</th>
                              <th>Status</th>
                              <th>Info</th>
                              <th className="text-end">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {requestsByService[service._id].map((req) => (
                              <BookingRequestRow
                                key={req._id}
                                req={req}
                                serviceId={service._id}
                                token={token}
                                onStatusChange={handleStatusChange}
                                onDelivery={handleDelivery}
                                actionLoading={actionLoading}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Edit Service Modal ── */}
      {editModal.open && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">✏️ Update Service</h5>
                <button className="btn-close" onClick={() => setEditModal({ open: false, service: null })} />
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body px-4">
                  {[
                    { label: 'Service Name', key: 'name', type: 'text' },
                    { label: 'Price (₹)', key: 'price', type: 'number' },
                    { label: 'Category', key: 'category', type: 'text' },
                    { label: 'Duration', key: 'duration', type: 'text', placeholder: 'e.g. 2 hours' },
                  ].map(({ label, key, type, placeholder }) => (
                    <div className="mb-3" key={key}>
                      <label className="form-label fw-semibold small">{label}</label>
                      <input
                        type={type}
                        className="form-control"
                        placeholder={placeholder || ''}
                        value={editForm[key]}
                        onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setEditModal({ open: false, service: null })}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={actionLoading}>
                    {actionLoading ? <span className="spinner-border spinner-border-sm me-1" /> : null} Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Slot Modal ── */}
      {slotModal.open && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">➕ Add Availability Slot</h5>
                <button className="btn-close" onClick={() => setSlotModal({ open: false, serviceId: null })} />
              </div>
              <form onSubmit={handleSlotSubmit}>
                <div className="modal-body px-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={slotForm.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSlotForm({ ...slotForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={slotForm.time}
                      onChange={(e) => setSlotForm({ ...slotForm, time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setSlotModal({ open: false, serviceId: null })}>Cancel</button>
                  <button type="submit" className="btn btn-success px-4" disabled={actionLoading}>
                    {actionLoading ? <span className="spinner-border spinner-border-sm me-1" /> : null} Add Slot
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={4000} />
    </>
  );
};

export default ServiceBookingRequests;
