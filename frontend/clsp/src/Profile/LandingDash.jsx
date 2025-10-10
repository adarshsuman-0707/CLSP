import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";

 function LandingDash() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="container-fluid min-vh-100 bg-light d-flex align-items-center justify-content-center">
      <div className="text-center">
        {/* Welcome Card */}
        <div
          className="card shadow-lg border-0 rounded-4 p-4"
          style={{ maxWidth: "600px", background: "#ffffff" }}
          data-aos="fade-up"
        >
          <div className="card-body">
            <div className="mb-4" data-aos="zoom-in" data-aos-delay="100">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="User Avatar"
                className="img-fluid rounded-circle shadow"
                width="120"
              />
            </div>
            <h2
              className="fw-bold text-primary mb-3"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              Welcome to Your Dashboard 🎉
            </h2>
            <p
              className="text-muted mb-4"
              data-aos="fade-left"
              data-aos-delay="300"
            >
              Manage your profile, view your payments, and explore your learning
              journey all in one place.
            </p>

            <div className="row gy-3" data-aos="fade-up" data-aos-delay="400">
              <div className="col-6 col-md-4">
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-person-circle fs-1 text-primary"></i>
                    <h6 className="mt-2 fw-semibold">Profile</h6>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-cash-coin fs-1 text-success"></i>
                    <h6 className="mt-2 fw-semibold">Payments</h6>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-body text-center">
                    <i className="bi bi-book-half fs-1 text-warning"></i>
                    <h6 className="mt-2 fw-semibold">Courses</h6>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4" data-aos="zoom-in-up" data-aos-delay="500">
              <button className="btn btn-primary px-4 py-2 rounded-3 shadow" >
               Visit Your Profile Section
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-muted mt-4 small" data-aos="fade-up" data-aos-delay="600">
          © 2025 KRP Digital. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
export default LandingDash;