import React, { useEffect, useLayoutEffect, useState } from 'react';
import Navbar from '../../Pages/NavbarProfile';
import {
    serviceall,

    deleteSlotFromService,
    updateSlotBookingStatus,
    BookedRequestByUser,
} from '../../Services/operation/serviceauthcall';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useNavigate } from 'react-router-dom';
const ServicePage = () => {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [token, setToken] = useState('');
    const [loadedRequests, setLoadedRequests] = useState({});
    const [requests, setRequests] = useState([]);
    const navigate = useNavigate();
    // Form state for adding a new service
    const [newService, setNewService] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        duration: '',
        availableSlots: [],
    });

    // Form state for adding slots for new service
    const [newSlot, setNewSlot] = useState({
        date: '',
        time: '',
        isBooked: false,
    });

    useLayoutEffect(() => {
        // Retrieve token from local storage
        const storedToken = localStorage.getItem('token'); // Adjust the key if needed
        setToken(storedToken);
    }, []);
    const [requestsByService, setRequestsByService] = useState({});
    const fetchBookedRequests = async (serviceId) => {
        try {
            const data = await BookedRequestByUser(serviceId, token);
            console.log("Booked Requests:", data);

            setRequestsByService((prev) => ({
                ...prev,
                [serviceId]: data.requests,
            }));
        } catch (error) {
            console.error("Error fetching booked requests:", error);
        }
    };

    const handleAccordionOpen = async (serviceId) => {
        if (!loadedRequests[serviceId]) {
            await fetchBookedRequests(serviceId);
            setLoadedRequests((prev) => ({ ...prev, [serviceId]: true }));
        }
    };
    useEffect(() => {}, [handleAccordionOpen]);
    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;
            try {
                const providerId = localStorage.getItem('serviceID');
                const servicesData = await serviceall(token);

                // Filter only services created by this provider
                const ownServices = servicesData.filter(
                    (service) =>
                        (service.createdBy?._id || service.createdBy) === providerId
                );

                setServices(ownServices);
                setFilteredServices(ownServices);
            } catch (error) {
                toast.error('Failed to fetch services.');
            }
        };
        fetchData();
    }, [token]);

    // Update filtered services when search term or services change
    useEffect(() => {
        const filtered = services.filter(
            (service) =>
                service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredServices(filtered);
    }, [searchTerm, services]);

    // Handle booking a slot
    // const handleBookNow = (serviceName, slot) => {
    //     setSelectedBooking({
    //         serviceName,
    //         date: new Date(slot.date).toDateString(),
    //         time: slot.time,
    //     });
    //     toast.success(`✅ You booked ${serviceName} on ${new Date(slot.date).toDateString()} at ${slot.time}`, {
    //         position: toast.POSITION.TOP_RIGHT,
    //         autoClose: 5000,
    //     });
    // };

    // // Handle input change for new service form
    // const handleNewServiceChange = (e) => {
    //   const { name, value } = e.target;
    //   setNewService((prev) => ({ ...prev, [name]: value }));
    // };

    // // Handle input change for new slot form
    // const handleNewSlotChange = (e) => {
    //   const { name, value } = e.target;
    //   setNewSlot((prev) => ({ ...prev, [name]: value }));
    // };

    const handleBookingAction = async (serviceId, slotId, action) => {
        try {
            const res = await fetch(
                `http://localhost:5000/api/service/${serviceId}/slot/${slotId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ status: action }),
                }
            );
            const data = await res.json();
            if (data.success) {
                alert(`Booking ${action} successfully!`);
                //   fetchServices(); // refresh list
            } else {
                alert("Something went wrong");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Delete slot handler
    const handleDeleteSlot = async (serviceId, slotId) => {
        try {
            await deleteSlotFromService(serviceId, slotId, token);
            toast.success('Slot deleted!');
            const updatedServices = await serviceall(token);
            setServices(updatedServices);
            setFilteredServices(updatedServices);
        } catch (error) {
            toast.error('Failed to delete slot.');
        }
    };

    // Update slot booking status handler (toggle)
    const toggleBookingStatus = async (serviceId, slot) => {
        try {
            const updatedStatus = !slot.isBooked;
            console.log("Updating slot:", serviceId, slot._id, updatedStatus);
            await updateSlotBookingStatus(serviceId, slot._id, updatedStatus, token);
            toast.success(`Slot marked as ${updatedStatus ? 'booked' : 'available'}`);
            const updatedServices = await serviceall(token);
            setServices(updatedServices);
            setFilteredServices(updatedServices);
        } catch (error) {
            toast.error('Failed to update slot status.');
        }
    };

    return (
        <>
            <Navbar />
            <br></br>
            <br></br>
            <br></br>
            <div className="container my-5">


                {/* Search input */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by service name or category"
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>


                {/* Services Listing */}
                <div className="accordion" id="servicesAccordion">
                    {filteredServices.length > 0 ? (
                        filteredServices.map((service, index) => (
                            <div className="accordion-item mb-4" key={service._id}>
                                {/* {fetchBookedRequests(service._id)}; */}
                                <h2 className="accordion-header" id={`heading-${index}`}>
                                    <button
                                        className="accordion-button collapsed"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapse-${index}`}
                                        aria-expanded="false"
                                        aria-controls={`collapse-${index}`}
                                        onClick={() => handleAccordionOpen(service._id)}
                                    >
                                        {service.name} &nbsp;|&nbsp; {service.category} &nbsp;|&nbsp; ₹{service.price}
                                    </button>

                                </h2>
                                <div
                                    id={`collapse-${index}`}
                                    className="accordion-collapse collapse"
                                    aria-labelledby={`heading-${index}`}
                                    data-bs-parent="#servicesAccordion"
                                >
                                    <div className="accordion-body">
                                        <p><strong>Description:</strong> {service.description} </p>
                                        <p><strong>Duration:</strong> {service.duration}</p>
                                        <h6>Available Slots:</h6>
                                        <div className="row">
                                            {service.availableSlots.map((slot) => (

                                                <div className="col-md-6 mb-3" key={slot._id}>
                                                    <div className="card p-3 shadow-sm h-100">
                                                        <p className="mb-1"><strong>Date:</strong> {new Date(slot.date).toDateString()}</p>
                                                        <p className="mb-2"><strong>Time:</strong> {slot.time}</p>
                                                        <div className="d-flex gap-2">

                                                            <button
                                                                className="btn btn-danger"
                                                                onClick={() => handleDeleteSlot(service._id, slot._id)}
                                                                type="button"
                                                            >
                                                                Delete Slot
                                                            </button>
                                                            <button
                                                                className={`btn ${slot.isBooked ? 'btn-warning' : 'btn-success'}`}
                                                                onClick={() => toggleBookingStatus(service._id, slot)}
                                                                type="button"
                                                            >
                                                                {slot.isBooked ? 'Mark Available' : 'Mark Booked'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <h6>Booking Requests:</h6>
                                        <div className="row">
                                            {requestsByService[service._id]?.length > 0 ? (
                                                requestsByService[service._id].map((req) => (
                                                    <div className="col-md-6 mb-3" key={req._id}>
                                                        <div className="card p-3 shadow-sm h-100">
                                                            <p><strong>Date:</strong> {new Date(req.date).toDateString()}</p>
                                                            <p><strong>Time:</strong> {req.time}</p>
                                                            <p><strong>Status:</strong>
                                                                <span className={`badge 
              ${req.bookingStatus === "approved" ? "bg-success" :
                                                                        req.bookingStatus === "rejected" ? "bg-danger" : "bg-warning text-dark"}`}>
                                                                    {req.bookingStatus}
                                                                </span>
                                                            </p>
                                                            <p><strong>Booked By:</strong> {req.bookedBy?.email || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No booking requests yet.</p>
                                            )}
                                        </div>

                                    </div>

                                </div>
                            </div>

                        ))
                    ) : (
                        <p>No services match your search.</p>
                    )}
                </div>

                {/* Booking summary is shown via toast, so no inline summary block */}
            </div >

            {/* Toast notifications container */}
            < ToastContainer position="top-right" autoClose={5000} />
        </>
    );
};

export default ServicePage;
