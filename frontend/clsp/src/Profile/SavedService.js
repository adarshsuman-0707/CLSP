import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getSavedServices, unsaveService } from "../Services/operation/SaveServiceUserCall";
import { NotificationAdd } from "../Services/operation/Notification";
import '../Pages/Stylesheet/Login.css'
const SavedService = () => {
    const [savedServices, setSavedServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const userID = localStorage.getItem("serviceID");
    
    // Helper function to check if date is in the past
    const isPastDate = (dateStr) => {
        const slotDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        return slotDate < today;
    };
    
    // Helper function to filter future slots
    const filterFutureSlots = (slots) => {
        return slots.filter(slot => !isPastDate(slot.date));
    };
    
    const fetchSavedServices = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await getSavedServices(token);

            console.log(response, " SavedService frontend");
            
            // ✅ Filter out blocked/rejected services
            const filteredServices = (response.savedServices || []).filter(item => {
                const service = item.service;
                // Only show services that are approved and not blocked
                return service && 
                       service.status !== 'blocked' && 
                       service.status !== 'rejected' &&
                       service.isApproved !== false;
            });
            
            // ✅ Filter out past date slots from each service
            const servicesWithFutureSlots = filteredServices.map(item => ({
                ...item,
                service: {
                    ...item.service,
                    availableSlots: filterFutureSlots(item.service.availableSlots || [])
                }
            }));
            
            setSavedServices(servicesWithFutureSlots);

        } catch (error) {
            console.error("Error fetching saved services:", error);
            setLoading(false);
        } finally {
            setTimeout(() => {
                setLoading(false);
            }, 3000);
        }
    };

    const handleUnsave = async (serviceId, servicename) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            await unsaveService(token, serviceId); // ✅ API call for unsave
            await NotificationAdd(token, { type: "service", title: "UnSaved service", message: `${servicename}Service Unsaved Successfully` })

            // UI se remove kar do
            setSavedServices((prev) =>
                prev.filter((item) => item.service.id !== serviceId)
            );
        } catch (error) {
            console.error("Error unsaving service:", error);
        }
        finally {
            setTimeout(() => { setLoading(false); }, 2000);
        }
    };

    useEffect(() => {
        fetchSavedServices();
    }, []);




    return (
        <>     {loading && (
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

            <div className="container my-4 saved">
                <br></br>

                <h2 className="text-center mt-5 mb-4 fw-bold">⭐ Your Saved Services</h2>
                <div className="row g-3 g-md-4">
                    {savedServices.length > 0 ? (
                        savedServices.map((item) => (
                            <div className="col-12 col-sm-6 col-lg-4 fade-in" key={item.id}>
                                <div
                                    className="card shadow-sm border-0 rounded-3 h-100"
                                    style={{
                                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                    }}
                                >       
                                      <div className="card-body p-3 p-md-4">
                                        <h5 className="card-title fw-bold text-primary mb-2" style={{fontSize: 'clamp(1rem, 4vw, 1.25rem)'}}>
                                            {item.service.name}
                                        </h5>
                                        <p className="card-text text-muted small mb-3" style={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {item.service.description}
                                        </p>

                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            <span className="badge bg-primary">💰 ₹{item.service.price}</span>
                                            <span className="badge bg-info text-dark">⏳ {item.service.duration}h</span>
                                            <span className="badge bg-secondary">{item.service.category}</span>
                                        </div>

                                        <div className="mt-3">
                                            <h6 className="fw-bold small mb-2">📅 Available Slots:</h6>
                                            {item.service.availableSlots.length > 0 ? (
                                                <div className="d-flex flex-column gap-1" style={{maxHeight: '150px', overflowY: 'auto'}}>
                                                    {item.service.availableSlots.slice(0, 3).map((slot, index) => (
                                                        <div
                                                            key={index}
                                                            className={`p-2 rounded small ${slot.isBooked
                                                                ? "bg-danger bg-opacity-10 text-danger"
                                                                : "bg-success bg-opacity-10 text-success"
                                                            }`}
                                                        >
                                                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-1">
                                                                <span className="fw-medium" style={{fontSize: '0.85rem'}}>
                                                                    {new Date(slot.date).toLocaleDateString('en-IN', {day: '2-digit', month: 'short'})} - {slot.time}
                                                                </span>
                                                                <span className="badge" style={{fontSize: '0.7rem'}}>
                                                                    {slot.isBooked ? "Booked" : "Available"}
                                                                </span>
                                                            </div>
                                                            {slot.bookedBy === userID && (
                                                                <small className="text-muted d-block mt-1" style={{fontSize: '0.7rem'}}>
                                                                    (Your booking)
                                                                </small>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {item.service.availableSlots.length > 3 && (
                                                        <small className="text-muted text-center">+{item.service.availableSlots.length - 3} more</small>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="alert alert-warning small mb-0 py-2">
                                                    <i className="fas fa-info-circle me-2"></i>
                                                    Service provider has not added future slots yet.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ✅ Unsave Button */}
                                    <div className="card-footer bg-white border-0 text-center p-2 p-md-3">
                                        <button
                                            className="btn btn-outline-danger btn-sm w-100 rounded-pill"
                                            onClick={() => handleUnsave(item.service.id, item.service.name)}
                                            style={{fontSize: '0.85rem'}}
                                        >
                                            ❌ Unsave
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center">
                            <h5 className="text-muted">No saved services found 😔</h5>
                        </div>
                    )}
                </div>
            </div></>
    );
};

export default SavedService;
