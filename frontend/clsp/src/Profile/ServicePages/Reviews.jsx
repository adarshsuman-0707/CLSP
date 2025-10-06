import React, { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import { getReviewByUser } from "../../Services/operation/Reviewauthcall";

const Reviews = () => {
  const [completedServices, setCompletedServices] = useState([]);
  const [fetchedReviews, setFetchedReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    AOS.init({ duration: 800 }); // Initialize AOS animation
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await getReviewByUser(token);
        if (response?.completedServices) setCompletedServices(response.completedServices);
        if (response?.fetchedReview) setFetchedReviews(response.fetchedReview);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load reviews.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-danger">{error}</p>;
  if (completedServices.length === 0)
    return <p className="text-center">No completed services found.</p>;

  return (
    <div className="container my-4">
      <br></br>
      <br></br>
      <br></br>
      <h1 align="center" data-aos="fade-up">Reviews</h1>
      <div className="row g-4">
        {completedServices.map((service) => {
          const serviceReviews = fetchedReviews.filter(
            (review) => review.reviewCardId === service._id
          );

          return serviceReviews.length > 0 ? (
            serviceReviews.map((review) => (
              <div
                key={review._id}
                className="col-12 col-sm-6 col-md-4"
                data-aos="fade-up"
              >
                <div className="card h-100 shadow-sm p-3">
                  {/* Service Details */}
                  <h5 className="fw-bold">{service.serviceName}</h5>
                  <p className="mb-1">{service.serviceDescription}</p>
                  <p className="mb-1">
                    <strong>Category:</strong> {service.serviceCategory}
                  </p>
                  <p className="mb-1">
                    <strong>Price:</strong> ₹{service.servicePrice}
                  </p>
                  <p className="mb-1">
                    <strong>Duration:</strong> {service.serviceDuration} hr
                  </p>
                  <p className="mb-2">
                    <strong>Status:</strong> {service.deliveryStatus}
                  </p>

                  {/* Review Section */}
                  <div className="border-top pt-2">
                    <h6>Customer Review</h6>
                    <div className="stars d-flex mb-1">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          color={i < review.rating ? "gold" : "lightgray"}
                        />
                      ))}
                    </div>
                    <p className="fw-semibold mb-1">{review.title}</p>
                    <p className="mb-1">{review.comment}</p>
                    <small className="text-muted">
                      Verified Customer: {review.isVerifiedCustomer ? "✅" : "❌"}
                    </small>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              key={service._id}
              className="col-12 col-sm-6 col-md-4"
              data-aos="fade-up"
            >
              <div className="card h-100 shadow-sm p-3">
                <h5 className="fw-bold">{service.serviceName}</h5>
                <p>{service.serviceDescription}</p>
                <p>
                  <strong>Category:</strong> {service.serviceCategory}
                </p>
                <p>
                  <strong>Price:</strong> ₹{service.servicePrice}
                </p>
                <p>
                  <strong>Duration:</strong> {service.serviceDuration} hr
                </p>
                <p>
                  <strong>Status:</strong> {service.deliveryStatus}
                </p>
                <p className="text-muted mt-2">No reviews yet.</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Reviews;
