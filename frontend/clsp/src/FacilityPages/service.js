import React, { useEffect, useState } from 'react';
import Navbar from '../Pages/NavbarProfile';
import { serviceall, servicerBookedByUser } from '../Services/operation/serviceauthcall';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './stylesheet/service.css'
import { savedService } from '../Services/operation/SaveServiceUserCall';
import { NotificationAdd } from '../Services/operation/Notification'; 
const ServiceList = () => {
  const token = localStorage.getItem('token');
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [timers, setTimers] = useState({});
  const [selectedService, setSelectedService] = useState(null); // 👈 Popup ke liye

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
      setTimeout(() => setLoading(false), 2000);
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
      setLoading(true)
      const booking = {
        serviceName,
        date: new Date(slot.date).toDateString(),
        time: slot.time,
      };

      const data = await servicerBookedByUser(serviceId, slot._id, token);
      console.log("Booking Response:", data);

      if (data.message.includes("booked")) {
        toast.success(`✅ You booked ${booking.serviceName} on ${booking.date} at ${booking.time}.`);
        setTimers(prev => ({ ...prev, [slot._id]: 150 })); // 150 seconds
        await NotificationAdd(token, {type:"service",title:"Booking Service",message:"Service Booked Successfully"})
        fetchServices();
      } else if (data.message.includes("cancelled")) {
        toast.success(`✅ You Cancelled ${booking.serviceName} on ${booking.date} at ${booking.time}.`);
    await NotificationAdd(token, {type:"service",title:"Booking Service",message:"Service cancelled Successfully"})

        setTimers(prev => ({ ...prev, [slot._id]: 0 }));
        fetchServices();
      } else {
        toast.error(data?.message || "❌ Failed to book the service.");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error("❌ Something went wrong." + error.message);
    }
    finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  const handleCancelBooking = async (serviceId, slotId) => {
    try {
      setLoading(true)
      const slot = filteredServices.flatMap(s => s.availableSlots).find(sl => sl._id === slotId);
      if (!slot) return;
      handleBookNow(slot.serviceName, serviceId, slot);
      
    }
    catch (e) {
      toast.error("Error in Cancel Booking Try Again")
    }
    finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  const handleSaveService = async (token, serviceId,servicename) => {
    try {
      setLoading(true)
      const res= await savedService(token, serviceId);
     await NotificationAdd(token, {type:"service",title:"Saved service",message:`${servicename}Service saved Successfully`})
      
      console.log(res)
      if(res?.message==="Service already saved"){
        return toast.info("Service Already Saved")
      }
      toast.success("Service Saved Successfully")
    } catch (e) {
      console.log(e)
      toast.error(e)
    }
    finally {
      setTimeout(() => setLoading(false), 2000);
    }
  }

  return (
    <>
      <Navbar />
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

  <br></br>
  <br></br>
      <div className="container mt-5 fade-in">
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
        {filteredServices.length === 0 ? (
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
                    <div className='d-flex justify-content-between'>
                      <p><strong>Description:</strong> {service.description}</p>
                      <p style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
                        {/* 👇 Popup button */}


                        <button className="eye" onClick={() => setSelectedService(service)}style={{ marginLeft: '15px' }}><svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg></button>
                        <button className="like" onClick={() => handleSaveService(token, service._id,service.name)} style={{ marginLeft: '15px' }}>❤️</button>
                      </p>
                    </div>
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

      {/* ✅ Popup Modal */}
      {selectedService && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <div className="modal-header">
                <h5 className="modal-title">Service Created By</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedService(null)}></button>
              </div>
              <div className="modal-body">
                <h6><b>First Name:</b> {selectedService.createdBy?.firstname}</h6>
                <h6><b>Last Name:</b> {selectedService.createdBy?.lastname}</h6>
                <h6><b>Email:</b> {selectedService.createdBy?.email}</h6>
                <h6><b>Contact:</b> {selectedService.createdBy?.contact}</h6>
                <h6><b>Address:</b> {selectedService.createdBy?.address}</h6>
                <h6><b>Pincode:</b> {selectedService.createdBy?.pincode}</h6>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedService(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </>
  );
};

export default ServiceList;
