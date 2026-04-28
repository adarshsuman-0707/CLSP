import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-0">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <h5 className="fw-bold mb-0">PLUMBER PRO</h5>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <a href="https://www.facebook.com/adarsh.suman.3532/" className="text-white mx-2" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://www.youtube.com/@adasrhsuman4832/" className="text-white mx-2" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.instagram.com/adarsh.suman.3532/" className="text-white mx-2" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="mailto:websitesudharo@gmail.com" className="text-white mx-2">
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>

        <div className="row mt-4">
  {/* Services Offered */}
  <div className="col-6 col-sm-6 col-md-3 mb-3 mb-md-0">
    <h6 className="fw-bold text-white">Services</h6>
    <ul className="list-unstyled mb-0">
      <li><a href="/" className="text-white-50 text-decoration-none">Pipe Repair</a></li>
      <li><a href="/" className="text-white-50 text-decoration-none">Leak Detection</a></li>
      <li><a href="/" className="text-white-50 text-decoration-none">Drain Cleaning</a></li>
      <li><a href="/" className="text-white-50 text-decoration-none">Water Heater Installation</a></li>
    </ul>
  </div>

  {/* About */}
  <div className="col-6 col-sm-6 col-md-3 mb-3 mb-md-0">
    <h6 className="fw-bold text-white">About Us</h6>
    <ul className="list-unstyled mb-0">
      <li><a href="/" className="text-white-50 text-decoration-none">Our Story</a></li>
      <li><a href="/" className="text-white-50 text-decoration-none">Why Choose Us</a></li>
      <li><a href="/" className="text-white-50 text-decoration-none">Team</a></li>
      <li><a href="/" className="text-white-50 text-decoration-none">Testimonials</a></li>
    </ul>
  </div>

  {/* Support */}
  <div className="col-6 col-sm-6 col-md-3 mb-3 mb-md-0">
    <h6 className="fw-bold text-white">Support</h6>
    <ul className="list-unstyled mb-0">
      <li><a href="/" className="text-white-50 text-decoration-none">FAQs</a></li>
      <li><a href="/" className="text-white-50 text-decoration-none">Contact Us</a></li>
      <li><a href="/" className="text-white-50 text-decoration-none">Booking Guide</a></li>
      <li><a href="/" className="text-white-50 text-decoration-none">Service Policy</a></li>
    </ul>
  </div>

  {/* Legal & Social */}
  <div className="col-6 col-sm-6 col-md-3 mb-3 mb-md-0">
    <h6 className="fw-bold text-white">Legal & Social</h6>
    <ul className="list-unstyled mb-0">
      <li><a href="/" className="text-white-50 text-decoration-none">Privacy Policy</a></li>
      <li><a href="/" className="text-white-50 text-decoration-none">Terms of Service</a></li>
      <li><a href="/" className="text-white-50 text-decoration-none">Facebook</a></li>
      <li><a href="/" className="text-white-50 text-decoration-none">Instagram</a></li>
    </ul>
  </div>
</div>

        {/* Copyright */}
        <div className="row mt-3 pt-3 border-top border-secondary">
          <div className="col-12 text-center">
            <small className="text-white-50">
              © {new Date().getFullYear()} CLSP. All rights reserved.
            </small>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
