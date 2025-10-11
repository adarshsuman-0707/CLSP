import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <h5 className="fw-bold">PLUMBER PRO</h5>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <a href="https://www.facebook.com/adarsh.suman.3532/" className="text-white mx-2">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://www.youtube.com/@adasrhsuman4832/" className="text-white mx-2">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.instagram.com/adarsh.suman.3532/" className="text-white mx-2">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="mailto:websitesudharo@gmail.com" className="text-white mx-2">
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>

        <div className="row mt-4">
  {/* Services Offered */}
  <div className="col-6 col-sm-6 col-md-3">
    <h6 className="fw-bold text-white">Services</h6>
    <ul className="list-unstyled">
      <li><a href="#" className="text-white-50">Pipe Repair</a></li>
      <li><a href="#" className="text-white-50">Leak Detection</a></li>
      <li><a href="#" className="text-white-50">Drain Cleaning</a></li>
      <li><a href="#" className="text-white-50">Water Heater Installation</a></li>
    </ul>
  </div>

  {/* About */}
  <div className="col-6 col-sm-6 col-md-3">
    <h6 className="fw-bold text-white">About Us</h6>
    <ul className="list-unstyled">
      <li><a href="#" className="text-white-50">Our Story</a></li>
      <li><a href="#" className="text-white-50">Why Choose Us</a></li>
      <li><a href="#" className="text-white-50">Team</a></li>
      <li><a href="#" className="text-white-50">Testimonials</a></li>
    </ul>
  </div>

  {/* Support */}
  <div className="col-6 col-sm-6 col-md-3">
    <h6 className="fw-bold text-white">Support</h6>
    <ul className="list-unstyled">
      <li><a href="#" className="text-white-50">FAQs</a></li>
      <li><a href="#" className="text-white-50">Contact Us</a></li>
      <li><a href="#" className="text-white-50">Booking Guide</a></li>
      <li><a href="#" className="text-white-50">Service Policy</a></li>
    </ul>
  </div>

  {/* Legal & Social */}
  <div className="col-6 col-sm-6 col-md-3">
    <h6 className="fw-bold text-white">Legal & Social</h6>
    <ul className="list-unstyled">
      <li><a href="#" className="text-white-50">Privacy Policy</a></li>
      <li><a href="#" className="text-white-50">Terms of Service</a></li>
      <li><a href="#" className="text-white-50">Facebook</a></li>
      <li><a href="#" className="text-white-50">Instagram</a></li>
    </ul>
  </div>
</div>

      </div>
    </footer>
  );
};

export default Footer;
