import React, { useEffect, useState } from 'react';
import Navbar from '../Pages/NavbarProfile';
import { serviceall, servicerBookedByUser } from '../Services/operation/serviceauthcall';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ServiceList = () => {
  const token = localStorage.getItem('token'); 
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [timers, setTimers] = useState({}); // { slotId: remainingSeconds }

  // Service fetch function
  const fetchServices = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await serviceall(token);
      const serviceData = data?.services || data; 
      setServices(serviceData);
      setFilteredServices(serviceData);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Search filter
  useEffect(() => {
    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [searchTerm, services]);

  // Countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(slotId => {
          if (updated[slotId] > 0) updated[slotId] -= 1;
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Booking function
  const handleBookNow = async (serviceName, serviceId, slot) => {
    try {
      const booking = {
        serviceName,
        date: new Date(slot.date).toDateString(),
        time: slot.time,
      };

      const data = await servicerBookedByUser(serviceId, slot._id, token);
      console.log("Booking Response:", data);

      if (data.message.includes("booked")) {
        toast.success(`✅ You booked ${booking.serviceName} on ${booking.date} at ${booking.time}.`);
        
        // Start 2-minute timer for this slot
        setTimers(prev => ({ ...prev, [slot._id]: 150 })); // 150 seconds

        fetchServices(); // refresh service list
      } else if (data.message.includes("cancelled")) {
        toast.success(`✅ You Cancelled ${booking.serviceName} on ${booking.date} at ${booking.time}.`);
        setTimers(prev => ({ ...prev, [slot._id]: 0 })); // reset timer
        fetchServices();
      } else {
        toast.error(data?.message || "❌ Failed to book the service.");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error("❌ Something went wrong.");
    }
  };

  const handleCancelBooking = async (serviceId, slotId) => {
    // Simply call the same booking API to toggle cancel
    const slot = filteredServices.flatMap(s => s.availableSlots).find(sl => sl._id === slotId);
    if (!slot) return;
    handleBookNow(slot.serviceName, serviceId, slot);
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <h2 className="mb-4">Available Services</h2>

        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Search services by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Service list */}
        {loading ? (
          <div className="text-center"><p>Loading services...</p></div>
        ) : filteredServices.length === 0 ? (
          <p>No services match your search.</p>
        ) : (
          <div className="accordion" id="servicesAccordion">
            {filteredServices.map((service, index) => (
              <div className="accordion-item mb-4" key={service._id}>
                <h2 className="accordion-header" id={`heading-${index}`}>
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${index}`}
                    aria-expanded="false"
                    aria-controls={`collapse-${index}`}
                  >
                    {service.name} | {service.category} | ₹{service.price}
                  </button>
                </h2>
                <div
                  id={`collapse-${index}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading-${index}`}
                  data-bs-parent="#servicesAccordion"
                >
                  <div className="accordion-body">
                    <p><strong>Description:</strong> {service.description}</p>
                    <p><strong>Duration:</strong> {service.duration}</p>
                    <h6>Available Slots:</h6>
                    <div className="row">
                      {service.availableSlots.map((slot) => {
                        const remaining = timers[slot._id] || 0;
                        const minutes = Math.floor(remaining / 60);
                        const seconds = remaining % 60;

                        return (
                          <div className="col-md-6 mb-3" key={slot._id}>
                            <div className="card p-3 shadow-sm h-100">
                              <p><strong>Date:</strong> {new Date(slot.date).toDateString()}</p>
                              <p><strong>Time:</strong> {slot.time}</p>
                              
                              {remaining > 0 && (
                                <p className="text-success">
                                  Time left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                                </p>
                              )}

                              <div className='d-flex justify-content-around gap-3'>
                                <button
                                  className="btn btn-primary w-50"
                                  disabled={slot.isBooked}
                                  onClick={() => handleBookNow(service.name, service._id, slot)}
                                >
                                  {slot.isBooked ? 'Booked' : 'Book Now'}
                                </button>
                                <button
                                  className="btn btn-danger w-50"
                                  disabled={!slot.isBooked}
                                  onClick={() => handleCancelBooking(service._id, slot._id)}
                                >
                                  Cancel Booking
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer />
    </>
  );
};

export default ServiceList;
