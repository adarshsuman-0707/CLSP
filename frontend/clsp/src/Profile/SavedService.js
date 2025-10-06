import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getSavedServices,unsaveService } from "../Services/operation/SaveServiceUserCall";
import { NotificationAdd } from "../Services/operation/Notification";
import '../Pages/Stylesheet/Login.css'
const SavedService = () => {
    const [savedServices, setSavedServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const userID = localStorage.getItem("serviceID");  
    const fetchSavedServices = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await getSavedServices(token);

            console.log(response, " SavedService frontend");
            setSavedServices(response.savedServices || []);
       
        } catch (error) {
            console.error("Error fetching saved services:", error);
            setLoading(false);
        }finally{
             setTimeout(() => {
    setLoading(false);
  }, 3000);
        }
    };

    const handleUnsave = async (serviceId,servicename) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
              await unsaveService(token, serviceId); // ✅ API call for unsave
         await NotificationAdd(token, {type:"service",title:"UnSaved service",message:`${servicename}Service Unsaved Successfully`})
              
            // UI se remove kar do
            setSavedServices((prev) =>
                prev.filter((item) => item.service.id !== serviceId)
            );
        } catch (error) {
            console.error("Error unsaving service:", error);
        }
        finally{
                setTimeout(() => {  setLoading(false); }, 2000);
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
            <div className="row g-4">
                {savedServices.length > 0 ? (
                    savedServices.map((item) => (
                        <div className="col-md-6 col-lg-4 fade-in" key={item.id}>
                            <div className="card shadow-lg border-0 rounded-4 h-100">
                                <div className="card-body p-4">
                                    <h5 className="card-title fw-bold text-primary">
                                        {item.service.name}
                                    </h5>
                                    <p className="card-text text-muted">
                                        {item.service.description}
                                    </p>

                                    <ul className="list-unstyled small">
                                        <li>
                                            <strong>💰 Price:</strong> ₹{item.service.price}
                                        </li>
                                        <li>
                                            <strong>⏳ Duration:</strong> {item.service.duration} hrs
                                        </li>
                                        <li>
                                            <strong>📂 Category:</strong> {item.service.category}
                                        </li>
                                    </ul>

                                    <div className="mt-3">
                                        <h6 className="fw-bold">📅 Available Slots:</h6>
                                        {item.service.availableSlots.length > 0 ? (
                                            <ul className="list-group small">
                                                {item.service.availableSlots.map((slot, index) => (
                                                    <li
                                                        key={index}
                                                        className={`list-group-item d-flex justify-content-between align-items-center ${slot.isBooked
                                                                ? "list-group-item-danger"
                                                                : "list-group-item-success"
                                                            }`}
                                                    >
                                                        <span>
                                                            {new Date(slot.date).toLocaleDateString()} -{" "}
                                                            {slot.time}
                                                        </span>
                                                        <span className={slot.isBooked ? "text-danger fw-bold" : "text-success fw-bold"}>
                                                            {slot.isBooked
                                                                ? "❌ This slot is booked, please wait for next allotment"
                                                                : "✅ Available"}
                                                                {
                                                                    slot.bookedBy===userID ? (
                                                                        <div className="mt-1">
                                                                            <small className="text-muted">
                                                                                (Booked by: yourself)
                                                                                
                                                                            </small>
                                                                        </div>
                                                                    ) : null
                                                                }
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-muted">No slots available</p>
                                        )}
                                    </div>
                                </div>

                                {/* ✅ Unsave Button */}
                                <div className="card-footer bg-white border-0 text-center">
                                    <button
                                        className="btn btn-outline-danger w-100 rounded-pill"
                                        onClick={() => handleUnsave(item.service.id,item.service.name)}
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
