// AddServicePage.js
import React, { useState } from 'react';
import { addService, serviceall } from '../../Services/operation/serviceauthcall';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../../Pages/NavbarProfile.js'
import { useNavigate } from 'react-router-dom';
import { set } from 'react-hook-form';
const AddServicePage = () => {
  const [token] = useState(localStorage.getItem('token'));
  const [newService, setNewService] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    duration: '',
    availableSlots: [],
  });

  let navigate=useNavigate()
  const [newSlot, setNewSlot] = useState({
    date: '',
    time: '',
    isBooked: false,
  });

  const handleNewServiceChange = (e) => {
    const { name, value } = e.target;
    setNewService((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewSlotChange = (e) => {
    const { name, value } = e.target;
    setNewSlot((prev) => ({ ...prev, [name]: value }));
  };

  const addSlotToNewService = () => {
    if (!newSlot.date || !newSlot.time) {
      toast.warn('Please fill date and time for the slot.');
      return;
    }
    setNewService((prev) => ({
      ...prev,
      availableSlots: [
        ...prev.availableSlots,
        {
          date: newSlot.date,
          time: newSlot.time,
          isBooked: false,
        },
      ],
    }));
    setNewSlot({ date: '', time: '', isBooked: false });
    toast.success('Slot added.');
  };
    const [loading, setLoading] = useState(false);
  const handleAddService = async () => {

    if (
      !newService.name ||
      !newService.category ||
      !newService.price ||
      !newService.description ||
      !newService.duration ||
      newService.availableSlots.length === 0
    ) {
      toast.warn('Please fill all fields and add at least one slot.');
      return;
    }

    try {
      setLoading(true);
      if (!token) {
        toast.error('Authentication failed. Please login again.');
        return;
      }
      const creatorId = localStorage.getItem('serviceID') || '';
      newService.duration+=newService.duration+ " Hour "
      await addService(creatorId, newService, token);
      toast.success('Service added successfully.');
      setNewService({
        name: '',
        category: '',
        price: '',
        description: '',
        duration: '',
        availableSlots: [],
      });
      navigate('/service/serviceall')
    } catch (error) {
      toast.error('Failed to add service.');
    }finally { setLoading(false); }
  };

  return (
    <>
    <Navbar/>
    <br />
    <br />
    
    
    <div className="container my-5">
      {loading && (
    <div className="Loading">
    <div id="wifi-loader">
    <svg class="circle-outer" viewBox="0 0 86 86">
        <circle class="back" cx="43" cy="43" r="40"></circle>
        <circle class="front" cx="43" cy="43" r="40"></circle>
        <circle class="new" cx="43" cy="43" r="40"></circle>
    </svg>
    <svg class="circle-middle" viewBox="0 0 60 60">
        <circle class="back" cx="30" cy="30" r="27"></circle>
        <circle class="front" cx="30" cy="30" r="27"></circle>
    </svg>
    <svg class="circle-inner" viewBox="0 0 34 34">
        <circle class="back" cx="17" cy="17" r="14"></circle>
        <circle class="front" cx="17" cy="17" r="14"></circle>
    </svg>
    <div class="text" data-text="Connecting"></div>
</div></div>
  )}
      <h2>Add New Service</h2>
      <div className="mb-3">
        <label className="form-label">Service Name</label>
        <input
          type="text"
          name="name"
          value={newService.name}
          onChange={handleNewServiceChange}
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Category</label>
        <input
          type="text"
          name="category"
          value={newService.category}
          onChange={handleNewServiceChange}
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Price (₹)</label>
        <input
          type="number"
          name="price"
          value={newService.price}
          onChange={handleNewServiceChange}
          className="form-control"
          min="0"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          name="description"
          value={newService.description}
          onChange={handleNewServiceChange}
          className="form-control"
          rows={3}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Duration</label>
        <input
          type="number"
          name="duration"
          value={newService.duration}
          onChange={handleNewServiceChange}
          className="form-control"
          placeholder="e.g. 1 hour"
        />
      </div>

      {/* Add Slots */}
      <div className="mb-3">
        <h5>Available Slots</h5>
        <div className="d-flex gap-2 mb-3">
          <input
            type="date"
            name="date"
            value={newSlot.date}
            onChange={handleNewSlotChange}
            className="form-control"
          />
          <input
            type="time"
            name="time"
            value={newSlot.time}
            onChange={handleNewSlotChange}
            className="form-control"
          />
          <button className="btn btn-success" onClick={addSlotToNewService} type="button">
            Add Slot
          </button>
        </div>
        <ul className="list-group">
          {newService.availableSlots.map((slot, idx) => (
            <li key={idx} className="list-group-item">
              {new Date(slot.date).toDateString()} @ {slot.time}
            </li>
          ))}
        </ul>
      </div>

      <button className="btn btn-primary" onClick={handleAddService} type="button">
        Add Service
      </button>

      <ToastContainer />
    </div></>
  );
};

export default AddServicePage;
