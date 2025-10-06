import React, { useState, useEffect } from "react";
import { addreview, getReviewDetails } from "../Services/operation/Reviewauthcall";
import { fetchHistoryDelivered } from "../Services/operation/HistoryauthCall";
import { NotificationAdd } from "../Services/operation/Notification";
import '../Pages/Stylesheet/Login.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from "react-toastify";

const ReviewService = () => {
  const [history, setHistory] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [title, setTitle] = useState("");
  const [reviews, setReviews] = useState([]); // all reviews fetched from backend
  const [loadings, setLoadings] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const reviewsRes = await getReviewDetails(token);
        console.log("Fetched reviews:", reviewsRes);
        // 1. Fetch completed services
        const historyRes = await fetchHistoryDelivered(token);
        setHistory(historyRes.completedServices || []);

        // 2. Fetch all reviews for this user (backend will filter by token)
        setReviews(reviewsRes.reviews || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const openReviewModal = (service) => {
    setSelectedService(service);
    setRating(service.userRating || 0);
    setComment(service.userComment || "");
    setTitle(service.userTitle || "");
  };

  const handleRatingSubmit = async () => {
    if (!rating) {
      alert("Please select a rating before submitting.");
      return;
    }
    try {

      setLoadings(true);

      const token = localStorage.getItem("token");
      const body = {
        serviceId: selectedService.ServiceID,
        rating,
        title,
        comment,
        reviewCardId: selectedService._id
      };
      const reviewsubmission = await addreview(token, body);
      if (reviewsubmission) {
        toast.success("Review Submitted")
        await NotificationAdd(token, { type: "review", title: "Review", message: "Review Submitted Successfully" })

      }
      // After submitting, fetch all reviews again from backend
      const res = await getReviewDetails(token);
      console.log("Updated reviews:", res.data);
      setReviews(res.reviews || []);

      // Update frontend history for instant card preview
      // setHistory(prev =>
      //   prev.map(item =>
      //     item._id === selectedService._id
      //       ? { ...item, userRating: rating, userComment: comment, userTitle: title }
      //       : item
      //   )
      // );

      setSelectedService(null);
      setRating(0);
      setComment("");
      setTitle("");
      alert("Review submitted successfully!");
    } catch (err) {
      console.error("Error submitting review:", err);
      alert(err.response?.data?.message || "Error submitting review");
    } finally {
      setTimeout(() => { setLoadings(false) }, 2000)
    }
  };

  return (
    <>
      {loadings && (
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
      <div className="container py-4">
        <br></br>
        <br></br>
        <br></br>

        <h2 className="mb-4 text-center">Completed Services</h2>
        <div className="row ">
          {history.map(service => {
            // Filter reviews for this particular card
            const reviewsForCard = reviews.filter(
              r => r.reviewCardId === service._id
            );

            return (
              <div key={service._id} className="col-md-6 mb-4 fade-in">
                <div className="card shadow-sm h-100"
                  style={{
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "none";
                  }}>
                  <div className="card-body">
                    <h5 className="card-title">{service.serviceName}</h5>
                    <p className="card-text">{service.serviceDescription}</p>
                    <p><strong>Category:</strong> {service.serviceCategory}</p>
                    <p><strong>Price:</strong> ₹{service.servicePrice}</p>
                    <p><strong>Duration:</strong> {service.serviceDuration} hr</p>
                    <p><strong>Serviceman:</strong> {service.servicemanName}</p>
                    <p><strong>Completed At:</strong> {new Date(service.completedAt).toLocaleString()}</p>

                    {/* Show user's own rating */}
                    {service.userRating && (
                      <div className="mt-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} style={{ color: star <= service.userRating ? "#ffc107" : "#e4e5e9", fontSize: "1.3rem" }}>★</span>
                        ))}
                        {service.userTitle && <h6 className="mt-2">{service.userTitle}</h6>}
                        {service.userComment && <p className="text-muted">"{service.userComment}"</p>}
                      </div>
                    )}

                    {/* Show reviews from backend */}
                    {reviewsForCard.length > 0 && (
                      <div className="mt-3">
                        <h6>Reviews:</h6>
                        {reviewsForCard.map(r => (
                          <div key={r._id} className="p-2 bg-light rounded mb-2">
                            <div>
                              {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} style={{ color: star <= r.rating ? "#ffc107" : "#e4e5e9" }}>★</span>
                              ))}
                            </div>
                            {r.title && <h6>{r.title}</h6>}
                            {r.comment && <p className="text-muted">{r.comment}</p>}
                            <small className="text-secondary">{new Date(r.createdAt).toLocaleDateString()}</small>
                          </div>
                        ))}
                      </div>
                    )}

                    <button className="btn btn-warning mt-3 w-100" onClick={() => openReviewModal(service)}>
                      {reviewsForCard.length > 0 ? "Update Review" : "Add Review"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal */}
        {selectedService && (
          <>
            <div className="modal show d-block" tabIndex="-1">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Rate {selectedService.serviceName}</h5>
                    <button type="button" className="btn-close" onClick={() => setSelectedService(null)}></button>
                  </div>
                  <div className="modal-body">
                    <input type="text" placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} className="form-control mb-3" />
                    <div className="mb-3 d-flex justify-content-center">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} onClick={() => setRating(star)} style={{ cursor: "pointer", fontSize: "1.8rem", color: star <= rating ? "#ffc107" : "#e4e5e9", margin: "0 5px" }}>★</span>
                      ))}
                    </div>
                    <textarea placeholder="Write a comment (optional)" value={comment} onChange={e => setComment(e.target.value)} className="form-control mb-3" />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setSelectedService(null)}>Cancel</button>
                    <button type="button" className="btn btn-warning" disabled={loadings} onClick={handleRatingSubmit}>
                      {loadings ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </>
        )}
      </div>
    </>
  );
};

export default ReviewService;
