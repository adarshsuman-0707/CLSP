import React, { useEffect, useLayoutEffect, useState } from 'react';
import Navbar from '../../Pages/NavbarProfile';
import {
    serviceall,
    deleteSlotFromService,
    updateSlotBookingStatus,
    BookedRequestByUser,
    servicerUpdateBookingStatus,
    UpdateServiceValue,
    AddSlots_Service,
    DeliveryServiceStatus
} from '../../Services/operation/serviceauthcall';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UpdateServicePopup from './UpdateServicePopup.jsx';
import { useNavigate } from 'react-router-dom';

const ServicePage = () => {
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [token, setToken] = useState('');
    const [loadedRequests, setLoadedRequests] = useState({});
    const [requestsByService, setRequestsByService] = useState({});
    const [loading, setLoading] = useState(false);
    const [popupOpen, setPopupOpen] = useState(false);
    const navigate = useNavigate();

    useLayoutEffect(() => {
        const storedToken = localStorage.getItem('token');
        setToken(storedToken);
    }, []);

    const fetchData = async () => {
        if (!token) return;
        try {
            const providerId = localStorage.getItem('serviceID');
            const servicesData = await serviceall(token);

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

    const fetchBookedRequests = async (serviceId) => {
        try {
            const data = await BookedRequestByUser(serviceId, token);
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

    useEffect(() => {
        fetchData();
    }, [token]);

    useEffect(() => {
        const filtered = services.filter(
            (service) =>
                service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredServices(filtered);
    }, [searchTerm, services]);

    // 🔹 Fix: Toggle booking status (optimistic update)
    const toggleBookingStatus = async (serviceId, slot) => {
        const updatedStatus = !slot.isBooked;
        setLoading(true);
        setServices((prev) =>
            prev.map((srv) =>
                srv._id === serviceId
                    ? {
                        ...srv,
                        availableSlots: srv.availableSlots.map((s) =>
                            s._id === slot._id ? { ...s, isBooked: updatedStatus } : s
                        ),
                    }
                    : srv
            )
        );

        try {
            await updateSlotBookingStatus(serviceId, slot._id, updatedStatus, token);
            toast.success(
                `Slot marked as ${updatedStatus ? 'booked' : 'available'}`
            );
        } catch (error) {
            toast.error('Failed to update slot status.');
            fetchData(); // rollback
        } finally { setLoading(false); }
    };

    // 🔹 Fix: Handle request status change
    const handleUserRequestStatus = async (serviceId, requestId, token, status) => {
        setRequestsByService((prev) => ({
            ...prev,
            [serviceId]: prev[serviceId].map((req) =>
                req._id === requestId ? { ...req, bookingStatus: status } : req
            ),
        }));
        setLoading(true);
        try {
            await servicerUpdateBookingStatus(serviceId, requestId, token, status);
            if(status=='Rejected')
            await  handleDeliveryServiceStatus(serviceId,requestId,"pending",token) 
            toast.success("Status updated successfully");
        } catch (e) {
            toast.error("Failed to update status");
            fetchBookedRequests(serviceId); // rollback
        }
        finally {
            setLoading(false);
        }
    };

    // 🔹 Fix: Delete slot
    const handleDeleteSlot = async (serviceId, slotId) => {
        setLoading(true);
        setServices((prev) =>
            prev.map((srv) =>
                srv._id === serviceId
                    ? {
                        ...srv,
                        availableSlots: srv.availableSlots.filter(
                            (s) => s._id !== slotId
                        ),
                    }
                    : srv
            )
        );

        try {
            await deleteSlotFromService(serviceId, slotId, token);
            toast.success('Slot deleted!');

        } catch (error) {
            toast.error('Failed to delete slot.');
            fetchData(); // rollback
        }
        finally {
            setLoading(false);
        }
    };

   
    const handlesetPopupOpen = (serviceId) => {
        setPopupOpen(true);
        setServiceId(serviceId);

    }

      const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        duration: ""
      });
    
      const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };
    
      const [serviceId, setServiceId] = useState(null);
      const handleSubmit = async(e) => {
       
       try{ 
        e.preventDefault();
        setLoading(true);
        console.log("Form Data Submitted:", formData); 
        await UpdateServiceValue(serviceId,formData,token);
        setPopupOpen(false);
        toast.success("Service data updated successfully.");

        fetchData();    
       }
       catch(error){    
        console.log("Error in updating the service data",error);
        toast.error("Failed to update service data.");
       }
       finally{ 
        setLoading(false);
       }
        
        // ✅ Console me dikh jayega
      };


      const [AddSlotPopup, setAddSlotPopup] = useState(false);
       const [formDatas, setFormDatas] = useState({ date: "", time: "" });
        const handleChange1 = (e) => {
        setFormDatas({ ...formDatas, [e.target.name]: e.target.value });
      };
      const handleSubmit_forSlot = async (e) => {
       try {
        setLoading(true);
        e.preventDefault();
        console.log("Slot Data Submitted:", formDatas);
        await AddSlots_Service(serviceId,formDatas,token);
        setAddSlotPopup(false);
        toast.success("Slot added successfully.");
        setFormDatas({ date: "", time: "" });

        fetchData();
        
       } catch (error) {
        toast.error("Failed to add slot.");
        console.log("Error in adding slot:", error);
       }
       finally {
        setLoading(false);
       }

      }
      const handleDeliveryServiceStatus=async(serviceId,requestId,status,token)=>{
        setLoading(true);
        try{
            await DeliveryServiceStatus(serviceId,requestId,status,token);
            if(status=='completed')
            toast.success("Service marked as completed.");
            else
                toast.success("Service Marked as Failed")
             setRequestsByService((prev) => ({
            ...prev,
            [serviceId]: prev[serviceId].map((req) =>
                req._id === requestId ? { ...req, ServiceDeliveryStatus: status } : req
            ),
        }));
            await fetchData();
        }
        catch(error){
            toast.error("Failed to mark service as completed.");
            console.log("Error in marking service as completed:",error);
        }
        finally{
            setTimeout(()=>{
                setLoading(false);
        },3000)
    }
}

    return (
        <>
            <Navbar />
            <br /><br /><br />

            {loading && (
                <div className="Loading">
                    <div id="wifi-loader">
                        <svg className="circle-outer" viewBox="0 0 86 86">
                            <circle className="back" cx="43" cy="43" r="40"></circle>
                            <circle className="front" cx="43" cy="43" r="40"></circle>
                            <circle className="new" cx="43" cy="43" r="40"></circle>
                        </svg>
                        <svg className="circle-middle" viewBox="0 0 60 60">
                            <circle className="back" cx="30" cy="30" r="27"></circle>
                            <circle className="front" cx="30" cy="30" r="27"></circle>
                        </svg>
                        <svg className="circle-inner" viewBox="0 0 34 34">
                            <circle className="back" cx="17" cy="17" r="14"></circle>
                            <circle className="front" cx="17" cy="17" r="14"></circle>
                        </svg>
                        <div className="text" data-text="Connecting"></div>
                    </div>
                </div>
            )}

            <div className="container my-5">
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by service name or category"
                        className="form-control"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="accordion" id="servicesAccordion">
                    {filteredServices.length > 0 ? (
                        filteredServices.map((service, index) => (
                            <div className="accordion-item mb-4" key={service._id}>
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
                                        <p><strong>Description:</strong><div className='d-flex flex-row justify-content-between'> {service.description}
                                            <button className='btn btn-primary' onClick={()=>handlesetPopupOpen(service._id)}>Update</button>
                                        </div> </p>
                                        <p><strong>Duration:</strong> {service.duration}</p>

                                        <div className='d-flex justify-content-between flex-row flex-wrap'> <h6>Available Slots:</h6> <button className='btn btn-info'onClick={()=>{setAddSlotPopup(true); setServiceId(service._id)}}>Add Slot</button> </div>
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
                                                                {slot.isBooked ? 'Booked' : 'Show Booking'}
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
                                                            <p>
                                                                <strong>Status:</strong>
                                                                <span
                                                                    className={`badge ${req.bookingStatus === "Approved"
                                                                        ? "bg-success"
                                                                        : req.bookingStatus === "Rejected"
                                                                            ? "bg-danger"
                                                                            : "bg-warning text-dark"
                                                                        }`}
                                                                >
                                                                    {req.bookingStatus}
                                                                </span>
                                                                <span>
                                                                    <button
                                                                        className="btn btn-primary ms-2"
                                                                        onClick={() =>
                                                                            handleUserRequestStatus(service._id, req._id, token, "Approved")
                                                                             
                                                                        }
                                                                        disabled={req.bookingStatus==="Approved"}
                                                                    >
                                                                        Accept
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-danger ms-2"
                                                                        onClick={() =>
                                                                            handleUserRequestStatus(service._id, req._id, token, "Rejected")
                                                                        }
                                                                          disabled={req.bookingStatus==="Rejected"}
                                                                    >
                                                                        Reject
                                                                    </button>
                                                                </span>
                                                            </p>
                                                          {req.bookedBy!=null? (<><p><strong>Booked By:</strong> {req.bookedBy?.firstname || "N/A"} {req.bookedBy?.lastname || "N/A"}</p>
                                                            <p><strong>Email:</strong> {req.bookedBy?.email || "N/A"}</p>
                                                            <p><strong>Address:</strong> {req.bookedBy?.address || "N/A"}</p>
                                                            <p><strong>Pincode:</strong> {req.bookedBy?.pincode || "N/A"}</p>
                                                           <p style={{width:"100%"}} className='d-flex justify-content-around'> <button className='btn btn-info' onClick={() => { handleDeliveryServiceStatus(service._id,req._id,"completed",token) }} disabled={req.ServiceDeliveryStatus === "completed" ||req.ServiceDeliveryStatus === "failed"}>Done</button>
                                                            <button className='btn btn-danger' onClick={() => { handleDeliveryServiceStatus(service._id,req._id,"failed",token) }}disabled={req.ServiceDeliveryStatus === "failed"|| req.ServiceDeliveryStatus === "completed"}>Cancel</button>
                                                            </p>
                                                            </>):(<p>No User Booked </p>)}

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
            </div>
            {popupOpen && (
               <>
                <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Update Service</h5>
            <button type="button" className="close" onClick={() => setPopupOpen(false)}>
              <span>&times;</span>
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group mb-2">
                <label>Service Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group mb-2">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group mb-2">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  className="form-control"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group mb-2">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group mb-2">
                <label>Duration (Hours)</label>
                <input
                  type="number"
                  name="duration"
                  className="form-control"
                  value={formData.duration}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setPopupOpen(false)}>
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
               </>
            )}
{
    AddSlotPopup &&(  
    <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Slot</h5>
                <button type="button" className="btn-close" onClick={() => setAddSlotPopup(false)}></button>
              </div>
              <form onSubmit={handleSubmit_forSlot}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={formDatas.date}
                      onChange={handleChange1}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Time</label>
                    <input
                      type="time"
                      name="time"
                      value={formDatas.time}
                      onChange={handleChange1}
                      className="form-control"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setAddSlotPopup(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Slot
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      
    )
}

            <ToastContainer position="top-right" autoClose={5000} />
        </>
    );
};

export default ServicePage;
