import React, { useEffect, useState } from 'react';
import Navbar from '../Pages/NavbarProfile';
import { serviceall, servicerBookedByUser } from '../Services/operation/serviceauthcall';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ServiceList = () => {
  const token = localStorage.getItem('token'); // ✅ direct lo, ek hi baar
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // ✅ Service fetch function
  const fetchServices = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await serviceall(token);
      const serviceData = data?.services || data; // structure ke hisaab se
      setServices(serviceData);
      setFilteredServices(serviceData);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial fetch
  useEffect(() => {
    fetchServices();
  }, []);


  // ✅ Search filter
  useEffect(() => {
    const filtered = services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [searchTerm, services]);

  // ✅ Booking function
  const handleBookNow = async (serviceName, serviceId, slot) => {
    try {
      const booking = {
        serviceName,
        date: new Date(slot.date).toDateString(),
        time: slot.time,
      };

      const data = await servicerBookedByUser(serviceId, slot._id, token);

      if (data) {
        toast.success(
          `✅ You booked ${booking.serviceName} on ${booking.date} at ${booking.time}.`
        );
        fetchServices(); // ⭐ Book ke baad dobara list fetch
      } else {
        toast.error(data?.message || "❌ Failed to book the service.");
      }
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error("❌ Something went wrong.");
    }
  };

  return (
    <>
      <Navbar />
      <br></br>
      <br></br>
      <br></br>
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
                      {service.availableSlots.map((slot) => (
                        <div className="col-md-6 mb-3" key={slot._id}>
                          <div className="card p-3 shadow-sm h-100">
                            <p><strong>Date:</strong> {new Date(slot.date).toDateString()}</p>
                            <p><strong>Time:</strong> {slot.time}</p>
                            <button
                              className="btn btn-primary w-100"
                              disabled={slot.isBooked}
                              onClick={() => handleBookNow(service.name, service._id, slot)}
                            >
                              {slot.isBooked ? 'Booked' : 'Book Now'}
                            </button>
                          </div>
                        </div>
                      ))}
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
