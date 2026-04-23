import React, { useState, useCallback, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
  updateVendorLocation, 
  addVendorAvailability,
  getVendorAvailability 
} from "../../Services/operation/vendorAuthCall";

const VendorLocationSetup = () => {
  const token = localStorage.getItem('token');
  const vendorId = localStorage.getItem('serviceID');

  // Location state
  const [locForm, setLocForm] = useState({
    latitude: "",
    longitude: "",
    address: "",
    serviceRadius: 10,
  });
  const [locLoading, setLocLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [locationSaved, setLocationSaved] = useState(false);

  // Availability state
  const [slots, setSlots] = useState([{ startTime: "", endTime: "" }]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [existingSlots, setExistingSlots] = useState([]);
  const [loadingExisting, setLoadingExisting] = useState(false);

  // Fetch existing availability slots
  const fetchExistingSlots = async () => {
    if (!vendorId) return;
    
    setLoadingExisting(true);
    try {
      const response = await getVendorAvailability(vendorId, token);
      if (response?.data) {
        setExistingSlots(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch existing slots:', error);
    } finally {
      setLoadingExisting(false);
    }
  };

  useEffect(() => {
    fetchExistingSlots();
  }, []);

  // Auto-detect location
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocForm((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setGeoLoading(false);
        toast.success("📍 Location detected successfully!");
      },
      (error) => {
        setGeoLoading(false);
        let errorMsg = "Could not detect location.";
        if (error.code === 1) {
          errorMsg = "Location permission denied. Please enable location access.";
        } else if (error.code === 2) {
          errorMsg = "Location unavailable. Please try again.";
        } else if (error.code === 3) {
          errorMsg = "Location request timeout. Please try again.";
        }
        toast.error(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  const handleLocChange = (e) => {
    setLocForm({ ...locForm, [e.target.name]: e.target.value });
  };

  const handleLocSubmit = async (e) => {
    e.preventDefault();
    
    if (!locForm.latitude || !locForm.longitude) {
      toast.warning("Latitude and longitude are required.");
      return;
    }

    // Validate coordinates
    const lat = parseFloat(locForm.latitude);
    const lng = parseFloat(locForm.longitude);
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Invalid coordinates. Please enter valid numbers.");
      return;
    }

    if (lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90.");
      return;
    }

    if (lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180.");
      return;
    }

    setLocLoading(true);
    try {
      const response = await updateVendorLocation(
        {
          latitude: lat,
          longitude: lng,
          address: locForm.address,
          serviceRadius: parseFloat(locForm.serviceRadius),
        },
        token
      );
      
      if (response?.message || response?.data) {
        toast.success("✅ Location updated successfully!");
        setLocationSaved(true);
      }
    } catch (err) {
      toast.error(err?.message || "Failed to update location.");
    } finally {
      setLocLoading(false);
    }
  };

  // Slot management
  const addSlotRow = () => {
    setSlots([...slots, { startTime: "", endTime: "" }]);
  };

  const removeSlotRow = (idx) => {
    if (slots.length === 1) {
      toast.warning("At least one slot is required.");
      return;
    }
    setSlots(slots.filter((_, i) => i !== idx));
  };

  const handleSlotChange = (idx, field, value) => {
    const updated = [...slots];
    updated[idx][field] = value;
    setSlots(updated);
  };

  const validateSlots = () => {
    const now = new Date();
    
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      
      if (!slot.startTime || !slot.endTime) {
        toast.warning(`Slot ${i + 1}: Please fill both start and end times.`);
        return false;
      }

      const start = new Date(slot.startTime);
      const end = new Date(slot.endTime);

      if (start < now) {
        toast.warning(`Slot ${i + 1}: Start time cannot be in the past.`);
        return false;
      }

      if (end <= start) {
        toast.warning(`Slot ${i + 1}: End time must be after start time.`);
        return false;
      }

      // Check minimum duration (e.g., 30 minutes)
      const duration = (end - start) / (1000 * 60); // minutes
      if (duration < 30) {
        toast.warning(`Slot ${i + 1}: Minimum duration is 30 minutes.`);
        return false;
      }
    }

    return true;
  };

  const handleSlotsSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateSlots()) {
      return;
    }

    setSlotLoading(true);
    try {
      const formattedSlots = slots.map((s) => ({
        startTime: new Date(s.startTime).toISOString(),
        endTime: new Date(s.endTime).toISOString(),
      }));

      const response = await addVendorAvailability(formattedSlots, token);
      
      if (response?.message || response?.data) {
        const count = response.data?.length || slots.length;
        toast.success(`✅ ${count} availability slot(s) added successfully!`);
        setSlots([{ startTime: "", endTime: "" }]);
        fetchExistingSlots(); // Refresh existing slots
      }
    } catch (err) {
      toast.error(err?.message || "Failed to add availability slots.");
    } finally {
      setSlotLoading(false);
    }
  };

  // Format date for display
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="container py-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold text-primary mb-1">⚙️ Vendor Setup</h2>
        <p className="text-muted mb-0">
          Configure your location and availability to help customers find you
        </p>
      </div>

      {/* Info Alert */}
      <div className="alert alert-info mb-4">
        <strong>ℹ️ Important:</strong> Setting up your location and availability helps customers 
        find you on the map and book services when you're available.
      </div>

      <div className="row g-4">
        {/* Location Card */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                  <span className="fs-4">📍</span>
                </div>
                <div>
                  <h5 className="fw-bold mb-0">Update Your Location</h5>
                  <small className="text-muted">
                    Set your service area so users can find you
                  </small>
                </div>
              </div>

              {locationSaved && (
                <div className="alert alert-success py-2 mb-3">
                  <small>✅ Location saved successfully!</small>
                </div>
              )}

              <form onSubmit={handleLocSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Latitude <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    className="form-control"
                    placeholder="e.g. 23.279504"
                    value={locForm.latitude}
                    onChange={handleLocChange}
                    required
                  />
                  <small className="text-muted">Range: -90 to 90</small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Longitude <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    className="form-control"
                    placeholder="e.g. 77.374811"
                    value={locForm.longitude}
                    onChange={handleLocChange}
                    required
                  />
                  <small className="text-muted">Range: -180 to 180</small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    placeholder="Street, City, State"
                    value={locForm.address}
                    onChange={handleLocChange}
                  />
                  <small className="text-muted">Optional but recommended</small>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Service Radius: <strong className="text-primary">{locForm.serviceRadius} km</strong>
                  </label>
                  <input
                    type="range"
                    name="serviceRadius"
                    className="form-range"
                    min="1"
                    max="50"
                    value={locForm.serviceRadius}
                    onChange={handleLocChange}
                  />
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">1 km</small>
                    <small className="text-muted">50 km</small>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-fill"
                    onClick={detectLocation}
                    disabled={geoLoading}
                  >
                    {geoLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" />
                        Detecting...
                      </>
                    ) : (
                      <>📍 Auto-detect</>
                    )}
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary flex-fill" 
                    disabled={locLoading}
                  >
                    {locLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" />
                        Saving...
                      </>
                    ) : (
                      <>💾 Save Location</>
                    )}
                  </button>
                </div>
              </form>

              {/* Current Location Display */}
              {locForm.latitude && locForm.longitude && (
                <div className="mt-3 p-3 bg-light rounded">
                  <small className="text-muted d-block mb-1">Current Coordinates:</small>
                  <small className="d-block">
                    <strong>Lat:</strong> {locForm.latitude}, <strong>Lng:</strong> {locForm.longitude}
                  </small>
                  {locForm.address && (
                    <small className="d-block mt-1">
                      <strong>Address:</strong> {locForm.address}
                    </small>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Availability Card */}
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-2 me-2">
                  <span className="fs-4">🕐</span>
                </div>
                <div>
                  <h5 className="fw-bold mb-0">Add Availability Slots</h5>
                  <small className="text-muted">
                    When are you available for service?
                  </small>
                </div>
              </div>

              <form onSubmit={handleSlotsSubmit}>
                {slots.map((slot, idx) => (
                  <div key={idx} className="border rounded-3 p-3 mb-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold small text-muted">
                        Slot {idx + 1}
                      </span>
                      {slots.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeSlotRow(idx)}
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>
                    <div className="row g-2">
                      <div className="col-12">
                        <label className="form-label small fw-semibold">
                          Start Time <span className="text-danger">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          className="form-control form-control-sm"
                          value={slot.startTime}
                          onChange={(e) => handleSlotChange(idx, "startTime", e.target.value)}
                          required
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">
                          End Time <span className="text-danger">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          className="form-control form-control-sm"
                          value={slot.endTime}
                          onChange={(e) => handleSlotChange(idx, "endTime", e.target.value)}
                          required
                          min={slot.startTime || new Date().toISOString().slice(0, 16)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="d-flex gap-2 mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-fill"
                    onClick={addSlotRow}
                  >
                    ➕ Add Another Slot
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success flex-fill" 
                    disabled={slotLoading}
                  >
                    {slotLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" />
                        Saving...
                      </>
                    ) : (
                      <>💾 Save Slots</>
                    )}
                  </button>
                </div>
              </form>

              {/* Existing Slots Display */}
              <div className="border-top pt-3">
                <h6 className="fw-semibold mb-2">
                  📅 Your Upcoming Availability ({existingSlots.length})
                </h6>
                {loadingExisting ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" />
                    <p className="small text-muted mt-2">Loading slots...</p>
                  </div>
                ) : existingSlots.length > 0 ? (
                  <div className="list-group list-group-flush" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {existingSlots.map((slot, idx) => (
                      <div key={slot._id || idx} className="list-group-item px-0 py-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <small className="d-block">
                              <strong>Start:</strong> {formatDateTime(slot.startTime)}
                            </small>
                            <small className="d-block">
                              <strong>End:</strong> {formatDateTime(slot.endTime)}
                            </small>
                          </div>
                          <span className={`badge ${slot.isBooked ? 'bg-warning text-dark' : 'bg-success'}`}>
                            {slot.isBooked ? 'Booked' : 'Available'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted small mb-0">
                    No upcoming availability slots. Add some above!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="card border-0 bg-light mt-4">
        <div className="card-body p-4">
          <h6 className="fw-bold mb-3">💡 Tips for Better Visibility</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="d-flex">
                <span className="me-2">📍</span>
                <div>
                  <strong className="d-block small">Accurate Location</strong>
                  <small className="text-muted">
                    Use auto-detect or enter precise coordinates for better search results
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex">
                <span className="me-2">🕐</span>
                <div>
                  <strong className="d-block small">Regular Availability</strong>
                  <small className="text-muted">
                    Add multiple time slots to increase booking opportunities
                  </small>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="d-flex">
                <span className="me-2">📏</span>
                <div>
                  <strong className="d-block small">Service Radius</strong>
                  <small className="text-muted">
                    Set a realistic radius based on your travel capacity
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLocationSetup;
