import React, { useState, useEffect } from "react";
import { Carousel, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./Navbars.js";
import plumber from "../assesst/plumber.jpg";
import carpenter from "../assesst/carpentertools.png";
import plumbing from "../assesst/PlumbingServices.jpg";
import "../Pages/Stylesheet/Home.css";
import Footer from "./Footer.js";
import ContactUs from "./ContactUs.js";
import { Link } from "react-scroll";
import AOS from "aos";
import "aos/dist/aos.css";

const Home = () => {
  useEffect(() => {
    AOS.init({
      duration: 2000,
      once: false,
      offset: 120,
      easing: "ease-in-out",
    });
  }, []);

  return (
    <div style={{ width: '100%', overflowX: 'hidden' }}>
      <Navbar />

      {/* HERO SECTION - full width, outside any container */}
      <section className="hero-section container-fluid" style={{ marginTop: '0px' }}>
        <Carousel fade controls indicators>
          <Carousel.Item interval={3000}>
            <img src={plumbing} alt="Plumbing Service 1" />
            <Carousel.Caption data-aos="fade-up">
              <h1 className="fw-bold text-white">Reliable Plumbing Services</h1>
              <p>24/7 Emergency Services | Affordable | Trusted Professionals</p>
              <Link to="services" smooth={true} duration={600} offset={-70}>
                <Button variant="light" size="lg">Explore Services</Button>
              </Link>
            </Carousel.Caption>
          </Carousel.Item>

          <Carousel.Item interval={3000}>
            <img src={plumber} alt="Plumbing Service 2" />
            <Carousel.Caption data-aos="fade-up">
              <h1 className="fw-bold text-white">Expert Pipe Repair</h1>
              <p>Fast & Reliable Solutions for Your Home & Office</p>
              <Link to="about" smooth={true} duration={600} offset={-70}>
                <Button variant="light" size="lg">Get a Quote</Button>
              </Link>
            </Carousel.Caption>
          </Carousel.Item>

          <Carousel.Item interval={3000}>
            <img src={carpenter} alt="Plumbing Service 3" />
            <Carousel.Caption data-aos="fade-up">
              <h1 className="fw-bold text-white">Certified & Trusted Plumbers</h1>
              <p>Experienced Professionals | Guaranteed Work</p>
              <Link to="contactUs" smooth={true} duration={600} offset={-20}>
                <Button variant="light" size="lg">Contact Us</Button>
              </Link>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </section>

      {/* ABOUT SECTION */}
      <section className="container py-5" id="about">
        <h2 className="text-center mb-5 fw-bold text-primary" data-aos="fade-down">
          Our About
        </h2>

        <div className="row justify-content-center">
          {/* Intro */}
          <div className="col-md-10 mb-4" data-aos="fade-up">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4">
                <p className="lead text-secondary mb-3">
                  <strong className="text-dark">At Plumber Pro,</strong> we are dedicated to providing top-quality plumbing solutions with a focus on
                  <b> reliability, efficiency,</b> and <b>affordability.</b> With years of experience in the industry, we’ve built a reputation for
                  delivering exceptional service to both homeowners and businesses.
                </p>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="col-md-10 mb-4" data-aos="zoom-in">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h3 className="fw-bold text-primary mb-3">Why Choose Us?</h3>
                <ul className="list-unstyled">
                  {[
                    "Experienced & Certified Plumbers – Our skilled professionals handle all types of plumbing issues, from minor repairs to full system installations.",
                    "24/7 Emergency Services – We offer round-the-clock assistance to keep your home or business running smoothly.",
                    "Affordable & Transparent Pricing – Honest rates, no hidden fees, and competitive pricing you can trust.",
                    "Fast & Reliable Solutions – We respond quickly and get the job done right the first time.",
                    "Customer Satisfaction Guaranteed – We ensure every job meets the highest standards.",
                  ].map((text, index) => (
                    <li key={index} className="mb-3 d-flex align-items-start">
                      <span className="text-success fs-5 me-2">✔</span>
                      <span className="text-secondary">{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Mission */}
          <div className="col-md-10 mb-4" data-aos="fade-left">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h3 className="fw-bold text-primary mb-3">Our Mission</h3>
                <p className="text-secondary lead">
                  Our mission is to make plumbing stress-free by offering dependable, affordable services that keep your home and business running
                  smoothly. Whether it’s <b>routine maintenance, major installations, or emergency repairs</b> — we’re here to help!
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="col-md-10" data-aos="fade-right">
            <div className="card border-0 shadow-lg rounded-4 bg-light">
              <div className="card-body p-4 text-center">
                <h4 className="fw-bold mb-3 text-primary">Need a Plumber? Call Us Today!</h4>
                <ul className="list-unstyled d-inline-block text-start">
                  {[
                    "24/7 Emergency Service",
                    "Licensed & Certified Plumbers",
                    "Affordable Pricing & No Hidden Fees",
                    "100% Satisfaction Guarantee",
                  ].map((text, index) => (
                    <li key={index} className="mb-2 d-flex align-items-start">
                      <span className="text-success fs-5 me-2">✔</span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <br></br>

      {/* SERVICES SECTION */}
      <section className="container py-5" id="services">
        <br></br>
        <br></br>

        <h2 className="text-center mb-4 fw-bold text-primary" data-aos="fade-down">
          Our Services
        </h2>
        <br></br>
        <br></br>
        <br></br>


        <div className="row">
          {[
            { title: "Plumbing Repairs", icon: "🚰", aos: "fade-up" },
            { title: "Fixture Installation", icon: "🚿", aos: "fade-right" },
            { title: "Leak Detection", icon: "💧", aos: "fade-left" },
            { title: "Drain Cleaning", icon: "🌀", aos: "zoom-in" },
            { title: "Emergency Services", icon: "⚠️", aos: "fade-up" },
            { title: "Carpentry Work", icon: "🪚", aos: "fade-up" },
            { title: "Water Heater Repair", icon: "🔥", aos: "zoom-in" },
            { title: "Bathroom Remodeling", icon: "🛁", aos: "fade-left" },
            { title: "Pipe Installation", icon: "🔩", aos: "fade-right" },
            { title: "Kitchen Plumbing", icon: "🍽️", aos: "flip-up" },
            { title: "Sewer Line Services", icon: "🚧", aos: "zoom-out" },
            { title: "Maintenance & Inspection", icon: "🔍", aos: "fade-up" },
          ].map((service, index) => (
            <div
              key={index}
              className="col-md-4 mb-4 h-100"
              data-aos={service.aos}
            >
              <div className="card text-center shadow p-4 h-100 " style={{
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}>
                <h3>{service.icon}</h3>
                <h4 className="fw-bold">{service.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <br></br>

      <section id="contactUs" data-aos="fade-up">
        <br></br>
        <br></br>
        <br></br>
        <ContactUs />
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Home;
