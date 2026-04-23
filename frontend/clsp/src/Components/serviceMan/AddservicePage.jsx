import React, { useState, useEffect } from 'react';
import { addService, getPublicCategories } from '../../Services/operation/serviceauthcall';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../Pages/NavbarProfile.js';
import { useNavigate } from 'react-router-dom';

const AddServicePage = () => {
  const token     = localStorage.getItem('token');
  const navigate  = useNavigate();

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [loading, setLoading]       = useState(false);

  const [newService, setNewService] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    duration: '',
    availableSlots: [],
  });

  const [newSlot, setNewSlot] = useState({ date: '', time: '' });

  // ── Fetch admin-defined categories on mount ──────────────────────────────
  useEffect(() => {
    const fetchCats = async () => {
      setCatLoading(true);
      try {
        const res = await getPublicCategories(token);
        if (res?.success) {
          setCategories(res.data || []);
        }
      } catch {
        toast.error('Could not load categories. Please refresh.');
      } finally {
        setCatLoading(false);
      }
    };
    fetchCats();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewService((prev) => ({ ...prev, [name]: value }));
  };

  const addSlot = () => {
    if (!newSlot.date || !newSlot.time) {
      toast.warn('Please fill date and time for the slot.');
      return;
    }
    setNewService((prev) => ({
      ...prev,
      availableSlots: [...prev.availableSlots, { date: newSlot.date, time: newSlot.time, isBooked: false }],
    }));
    setNewSlot({ date: '', time: '' });
    toast.success('Slot added.');
  };

  const removeSlot = (idx) => {
    setNewService((prev) => ({
      ...prev,
      availableSlots: prev.availableSlots.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async () => {
    const { name, category, price, description, duration, availableSlots } = newService;
    if (!name || !category || !price || !description || !duration || availableSlots.length === 0) {
      toast.warn('Please fill all fields and add at least one slot.');
      return;
    }
    if (!token) {
      toast.error('Authentication failed. Please login again.');
      return;
    }

    setLoading(true);
    try {
      const creatorId = localStorage.getItem('serviceID') || '';
      const payload   = { ...newService, duration: `${duration} Hour` };
      const res       = await addService(creatorId, payload, token);

      if (res?.success || res?.service) {
        toast.success('Service created! Waiting for admin approval.');
        setTimeout(() => navigate('/Service/profile'), 1500);
      } else {
        toast.error(res?.message || 'Failed to add service.');
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to add service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <br /><br />

      <div className="container my-5" style={{ maxWidth: 680 }}>
        {loading && (
          <div className="Loading">
            <div id="wifi-loader">
              <svg className="circle-outer" viewBox="0 0 86 86">
                <circle className="back" cx="43" cy="43" r="40" />
                <circle className="front" cx="43" cy="43" r="40" />
                <circle className="new" cx="43" cy="43" r="40" />
              </svg>
              <svg className="circle-middle" viewBox="0 0 60 60">
                <circle className="back" cx="30" cy="30" r="27" />
                <circle className="front" cx="30" cy="30" r="27" />
              </svg>
              <svg className="circle-inner" viewBox="0 0 34 34">
                <circle className="back" cx="17" cy="17" r="14" />
                <circle className="front" cx="17" cy="17" r="14" />
              </svg>
              <div className="text" data-text="Connecting" />
            </div>
          </div>
        )}

        <h2 className="fw-bold mb-1">Add New Service</h2>
        <p className="text-muted mb-4">
          Your service will be reviewed by admin before it becomes visible to users.
        </p>

        {/* Service Name */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Service Name <span className="text-danger">*</span></label>
          <input
            type="text"
            name="name"
            value={newService.name}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g. Pipe Leak Repair"
          />
        </div>

        {/* Category — dropdown from admin-defined list */}
        <div className="mb-3">
          <label className="form-label fw-semibold">
            Category <span className="text-danger">*</span>
          </label>
          {catLoading ? (
            <div className="d-flex align-items-center gap-2 text-muted">
              <span className="spinner-border spinner-border-sm" />
              <small>Loading categories...</small>
            </div>
          ) : categories.length === 0 ? (
            <div className="alert alert-warning py-2 mb-0">
              No categories available yet. Ask admin to add categories first.
            </div>
          ) : (
            <select
              name="category"
              value={newService.category}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">— Select a category —</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Price */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Price (₹) <span className="text-danger">*</span></label>
          <input
            type="number"
            name="price"
            value={newService.price}
            onChange={handleChange}
            className="form-control"
            min="0"
            placeholder="e.g. 500"
          />
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Description <span className="text-danger">*</span></label>
          <textarea
            name="description"
            value={newService.description}
            onChange={handleChange}
            className="form-control"
            rows={3}
            placeholder="Describe what you offer..."
          />
        </div>

        {/* Duration */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Duration (hours) <span className="text-danger">*</span></label>
          <input
            type="number"
            name="duration"
            value={newService.duration}
            onChange={handleChange}
            className="form-control"
            min="0.5"
            step="0.5"
            placeholder="e.g. 1"
          />
        </div>

        {/* Slots */}
        <div className="mb-4">
          <h5 className="fw-semibold">Available Slots <span className="text-danger">*</span></h5>
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <input
              type="date"
              value={newSlot.date}
              onChange={(e) => setNewSlot((p) => ({ ...p, date: e.target.value }))}
              className="form-control"
              style={{ maxWidth: 180 }}
              min={new Date().toISOString().split('T')[0]}
            />
            <input
              type="time"
              value={newSlot.time}
              onChange={(e) => setNewSlot((p) => ({ ...p, time: e.target.value }))}
              className="form-control"
              style={{ maxWidth: 140 }}
            />
            <button className="btn btn-success" onClick={addSlot} type="button">
              + Add Slot
            </button>
          </div>

          {newService.availableSlots.length > 0 && (
            <ul className="list-group">
              {newService.availableSlots.map((slot, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    📅 {new Date(slot.date).toDateString()} &nbsp;🕐 {slot.time}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => removeSlot(idx)}
                    type="button"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          className="btn btn-primary w-100"
          onClick={handleSubmit}
          disabled={loading || catLoading}
          type="button"
        >
          {loading ? (
            <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
          ) : (
            'Submit Service for Approval'
          )}
        </button>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </>
  );
};

export default AddServicePage;
