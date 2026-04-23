import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Navbar from '../Pages/NavbarProfile';
import { serviceall, servicerBookedByUser } from '../Services/operation/serviceauthcall';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { savedService } from '../Services/operation/SaveServiceUserCall';
import { NotificationAdd } from '../Services/operation/Notification';
import useSSE from '../hooks/useSSE';

// ── Countdown hook — derives remaining time from bookedAt timestamp ───────────
// Returns null if slot is not pending-booked by current user
const CANCEL_WINDOW_MS = 2 * 60 * 1000; // 2 minutes

const useSlotCountdown = (slot, currentUserId) => {
  const [remaining, setRemaining] = useState(0);

  const isMyPendingSlot =
    slot.isBooked &&
    slot.bookingStatus === 'pending' &&
    (slot.bookedBy?._id || slot.bookedBy)?.toString() === currentUserId;

  useEffect(() => {
    if (!isMyPendingSlot || !slot.bookedAt) {
      setRemaining(0);
      return;
    }
    const tick = () => {
      const elapsed = Date.now() - new Date(slot.bookedAt).getTime();
      setRemaining(Math.max(0, CANCEL_WINDOW_MS - elapsed));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isMyPendingSlot, slot.bookedAt]);

  const mins = String(Math.floor(remaining / 60000)).padStart(2, '0');
  const secs = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
  return { remaining, label: `${mins}:${secs}`, isMyPendingSlot };
};

// ── Single slot row ───────────────────────────────────────────────────────────
const SlotRow = ({ slot, service, currentUserId, onBook, onCancel, actionLoading }) => {
  const { remaining, label, isMyPendingSlot } = useSlotCountdown(slot, currentUserId);

  const isApproved      = slot.bookingStatus === 'Approved';
  const isBookedByMe    = slot.isBooked && (slot.bookedBy?._id || slot.bookedBy)?.toString() === currentUserId;
  const isBookedByOther = slot.isBooked && !isBookedByMe;
  const canCancel       = isBookedByMe && slot.bookingStatus === 'pending';
  const canBook         = !slot.isBooked;

  // Delivery status (set by serviceman after accepting)
  const deliveryDone   = slot.ServiceDeliveryStatus === 'completed';
  const deliveryFailed = slot.ServiceDeliveryStatus === 'failed';

  // ── Status badge ────────────────────────────────────────────────────────────
  let statusBadge;
  if (isBookedByMe && deliveryFailed)
    statusBadge = <span className="badge bg-danger">❌ Service Failed</span>;
  else if (isBookedByMe && deliveryDone)
    statusBadge = <span className="badge bg-primary">✅ Completed</span>;
  else if (isApproved && isBookedByMe)
    statusBadge = <span className="badge bg-success">✅ Accepted</span>;
  else if (isApproved && isBookedByOther)
    statusBadge = <span className="badge bg-secondary">Unavailable</span>;
  else if (isBookedByMe)
    statusBadge = <span className="badge bg-warning text-dark">⏳ Pending</span>;
  else if (isBookedByOther)
    statusBadge = <span className="badge bg-secondary">Booked</span>;
  else
    statusBadge = <span className="badge bg-success">Available</span>;

  // ── Info text ───────────────────────────────────────────────────────────────
  let infoText = null;
  if (isMyPendingSlot && remaining > 0)
    infoText = <span className="text-warning fw-semibold">⏱ Cancel within {label}</span>;
  else if (isMyPendingSlot && remaining === 0)
    infoText = <span className="text-muted small">Awaiting serviceman</span>;
  else if (isBookedByMe && deliveryFailed)
    infoText = <span className="text-danger small">The serviceman marked this service as failed.</span>;
  else if (isBookedByMe && deliveryDone)
    infoText = <span className="text-primary small">Service completed successfully.</span>;
  else if (isApproved && isBookedByMe)
    infoText = <span className="text-success small">Booking confirmed!</span>;

  return (
    <tr>
      <td className="small">
        {new Date(slot.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </td>
      <td className="small">{slot.time}</td>
      <td>{statusBadge}</td>
      <td className="small">{infoText}</td>
      <td className="text-end">
        {canBook && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onBook(service, slot)}
            disabled={actionLoading}
          >
            📅 Book Now
          </button>
        )}
        {canCancel && (
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => onCancel(service._id, slot._id)}
            disabled={actionLoading}
            title={remaining === 0 ? 'Cancel window expired — contact serviceman' : 'Cancel booking'}
          >
            ✖ Cancel
          </button>
        )}
        {isApproved && isBookedByMe && !deliveryDone && !deliveryFailed && (
          <span className="text-success small fw-semibold">Confirmed ✅</span>
        )}
        {isBookedByOther && (
          <span className="text-muted small">—</span>
        )}
      </td>
    </tr>
  );
};

// ── Provider info modal ───────────────────────────────────────────────────────
const ProviderModal = ({ service, onClose }) => (
  <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.55)' }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content rounded-4 border-0 shadow-lg">
        <div className="modal-header border-0">
          <h5 className="modal-title fw-bold">👤 Service Provider</h5>
          <button className="btn-close" onClick={onClose} />
        </div>
        <div className="modal-body px-4">
          <div className="d-flex flex-column gap-2">
            {[
              ['Name', `${service.createdBy?.firstname} ${service.createdBy?.lastname}`],
              ['Email', service.createdBy?.email],
              ['Contact', service.createdBy?.contact],
              ['Address', service.createdBy?.address],
              ['Pincode', service.createdBy?.pincode],
            ].map(([label, val]) => (
              <div key={label} className="d-flex gap-2">
                <span className="fw-semibold text-muted" style={{ minWidth: 70 }}>{label}:</span>
                <span>{val || '—'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer border-0">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const ServiceList = () => {
  const token        = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('serviceID'); // login stores as serviceID

  const [services, setServices]           = useState([]);
  const [searchTerm, setSearchTerm]       = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading]             = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null); // provider modal

  const fetchServices = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await serviceall(token);
      setServices(Array.isArray(data) ? data : (data?.data || data?.services || []));
    } catch {
      toast.error('Failed to fetch services.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  // ── Real-time updates via SSE ────────────────────────────────────────────────
  // When serviceman accepts/rejects → silently re-fetch so user sees updated status
  useSSE(token, useCallback((event) => {
    const refreshTypes = ['booking:status', 'delivery:status', 'booking:cancelled'];
    if (refreshTypes.includes(event.type)) {
      fetchServices();
      if (event.type === 'booking:status') {
        const status = event.payload?.status;
        const name   = event.payload?.serviceName || 'Your booking';
        if (status === 'Approved') toast.success(`✅ ${name} — booking accepted!`);
        if (status === 'Rejected') toast.error(`❌ ${name} — booking rejected.`);
      }
      if (event.type === 'delivery:status') {
        const status = event.payload?.status;
        if (status === 'completed') toast.success('🏁 Service marked as completed!');
        if (status === 'failed')    toast.error('❌ Service was marked as failed by the serviceman.');
      }
    }
  }, [fetchServices]));

  // ── Derived list ────────────────────────────────────────────────────────────
  const categories = useMemo(() => {
    const cats = [...new Set(services.map((s) => s.category).filter(Boolean))];
    return cats.sort();
  }, [services]);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      const matchCat = categoryFilter === 'all' || s.category === categoryFilter;
      const hasSlots = s.availableSlots?.length > 0;
      return matchSearch && matchCat && hasSlots;
    });
  }, [services, searchTerm, categoryFilter]);

  // ── Book a slot ─────────────────────────────────────────────────────────────
  const handleBook = async (service, slot) => {
    setActionLoading(true);
    try {
      const res = await servicerBookedByUser(service._id, slot._id, token);
      if (res.booked) {
        toast.success(`✅ Booked ${service.name} on ${new Date(slot.date).toDateString()} at ${slot.time}. Awaiting confirmation.`);
        await NotificationAdd(token, { type: 'service', title: 'Booking', message: `${service.name} booked successfully` });
        fetchServices();
      } else {
        toast.error(res?.message || 'Booking failed.');
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : err?.message || 'Booking failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Cancel a booking ────────────────────────────────────────────────────────
  const handleCancel = async (serviceId, slotId) => {
    if (!window.confirm('Cancel this booking?')) return;
    setActionLoading(true);
    try {
      const res = await servicerBookedByUser(serviceId, slotId, token);
      if (res.cancelled) {
        toast.success('Booking cancelled.');
        await NotificationAdd(token, { type: 'service', title: 'Booking', message: 'Booking cancelled' });
        fetchServices();
      } else {
        toast.error(res?.message || 'Cannot cancel.');
      }
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Cancel failed.';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Save service ────────────────────────────────────────────────────────────
  const handleSave = async (serviceId, serviceName) => {
    try {
      const res = await savedService(token, serviceId);
      if (res?.message === 'Service already saved') return toast.info('Already saved.');
      toast.success(`${serviceName} saved!`);
      await NotificationAdd(token, { type: 'service', title: 'Saved', message: `${serviceName} saved` });
    } catch {
      toast.error('Failed to save service.');
    }
  };

  return (
    <>
      <Navbar />

      {/* Full-screen loading overlay */}
      {(loading || actionLoading) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner-border text-light" style={{ width: '3rem', height: '3rem' }} />
        </div>
      )}

      <div className="container mt-5 pt-4 pb-5">
        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h4 className="fw-bold mb-0">🔧 Available Services</h4>
            <small className="text-muted">{filtered.length} service{filtered.length !== 1 ? 's' : ''} found</small>
          </div>
          <button className="btn btn-outline-primary btn-sm" onClick={fetchServices} disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        {/* ── Filters ────────────────────────────────────────────────────────── */}
        <div className="row g-2 mb-4">
          <div className="col-12 col-sm-6 col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-6 col-sm-4 col-md-3">
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Empty state ─────────────────────────────────────────────────────── */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-5 text-muted">
            <div className="fs-1">🔧</div>
            <h5 className="mt-2">No services found</h5>
            <p>Try adjusting your search or category filter.</p>
          </div>
        )}

        {/* ── Services accordion ──────────────────────────────────────────────── */}
        <div className="accordion" id="servicesAccordion">
          {filtered.map((service, index) => (
            <div className="accordion-item mb-3 border-0 shadow-sm rounded-4 overflow-hidden" key={service._id}>
              {/* Header */}
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed fw-semibold"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#svc-${index}`}
                >
                  <span className="me-2">🔧</span>
                  <span className="me-2">{service.name}</span>
                  <span className="badge bg-secondary me-1">{service.category}</span>
                  <span className="badge bg-success me-1">₹{service.price}</span>
                  <span className="badge bg-info text-dark me-1">⏱ {service.duration}</span>
                  <span className="badge bg-primary">
                    {service.availableSlots.filter((s) => !s.isBooked).length} free slot{service.availableSlots.filter((s) => !s.isBooked).length !== 1 ? 's' : ''}
                  </span>
                </button>
              </h2>

              {/* Body */}
              <div id={`svc-${index}`} className="accordion-collapse collapse">
                <div className="accordion-body bg-white">
                  {/* Service meta */}
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                    <p className="text-muted mb-0">{service.description}</p>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setSelectedService(service)}
                        title="View provider info"
                      >
                        👤 Provider
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleSave(service._id, service.name)}
                        title="Save to favourites"
                      >
                        ❤️ Save
                      </button>
                    </div>
                  </div>

                  {/* Slots table */}
                  <div className="table-responsive rounded-3 border">
                    <table className="table table-sm table-hover mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Info</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {service.availableSlots.map((slot) => (
                          <SlotRow
                            key={slot._id}
                            slot={slot}
                            service={service}
                            currentUserId={currentUserId}
                            onBook={handleBook}
                            onCancel={handleCancel}
                            actionLoading={actionLoading}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cancel window note */}
                  <small className="text-muted d-block mt-2">
                    ℹ️ You can cancel a pending booking within 2 minutes. Once the serviceman accepts, cancellation is not possible.
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Provider info modal */}
      {selectedService && (
        <ProviderModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}

      <ToastContainer position="top-right" autoClose={4000} />
    </>
  );
};

export default ServiceList;
