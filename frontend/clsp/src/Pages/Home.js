import React, { useState } from "react";
import { Carousel, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from './Navbars.js'
import plumber from '../assesst/plumber.jpg'
import carpenter from '../assesst/carpentertools.png'
import plumbing from  '../assesst/PlumbingServices.jpg'
import '../Pages/Stylesheet/Home.css'
import Footer from "./Footer.js";
import ContactUs from "./ContactUs.js";
import {Link} from 'react-scroll'
const Home = () => {


  return (
    <>
    
<Navbar/>


      {/* Hero Section */}
      
      <section className="hero-section ">
      <Carousel fade controls indicators>
        {/* Slide 1 */}
        <Carousel.Item interval={3000}>
          <img
            className="d-block w-100"
            src={plumbing}
            alt="Plumbing Service 1"
          />
          <Carousel.Caption>
            <h1 className="fw-bold text-white">Reliable Plumbing Services</h1>
            <p>24/7 Emergency Services | Affordable | Trusted Professionals</p>
            <Link to="services" smooth={true} duration={600} offset={-70}>
            <Button variant="light" size="lg">
              Explore Services
            </Button>
            </Link>
          </Carousel.Caption>
        </Carousel.Item>

        {/* Slide 2 */}
        <Carousel.Item interval={3000}>
          <img
            className="d-block w-100"
            src={plumber}
            alt="Plumbing Service 2"
          />
          <Carousel.Caption>
            <h1 className="fw-bold text-white">Expert Pipe Repair</h1>
            <p>Fast & Reliable Solutions for Your Home & Office</p>
            <Link to="about" smooth={true} duration={600} offset={-70}>
            <Button variant="light" size="lg" >
              Get a Quote
            </Button></Link>
          </Carousel.Caption>
        </Carousel.Item>

        {/* Slide 3 */}
        <Carousel.Item interval={3000}>
          <img
            className="d-block w-100"
            src={carpenter}
            alt="Plumbing Service 3"
          />
          <Carousel.Caption>
            <h1 className="fw-bold text-white">Certified & Trusted Plumbers</h1>
            <p>Experienced Professionals | Guaranteed Work</p>
            <Link to="contactUs" smooth={true} duration={600} offset={-20}>

            <Button variant="light" size="lg">
              Contact Us
            </Button></Link>
          </Carousel.Caption>
        </Carousel.Item>
      </Carousel>
    </section>
    
            {/* Services About */}
      <section className="container py-5" id="about">
        <h2 className="text-center mb-4">Our About</h2>
        <div className="row">
          
        <div className="max-w-4xl mx-auto p-3 bg-white shadow-lg rounded-lg">
      <p className="mb-4 text-lg">
        <strong>At Plumber Pro,</strong> we are dedicated to providing top-quality plumbing solutions with a focus on reliability, efficiency, and affordability. With years of experience in the industry, we have built a reputation for delivering exceptional service to homeowners and businesses alike.
      </p>
      <h3 className="font-bold text-xl">Why Choose Us?</h3>
      <ul className="list-disc list-inside mt-4 space-y-2">
        {[
          "Experienced & Certified Plumbers – Our skilled professionals are trained to handle all types of plumbing issues, from minor repairs to full system installations.",
          "24/7 Emergency Services – Plumbing problems can arise at any time, which is why we offer round-the-clock emergency assistance to get your home or business back on track.",
          "Affordable & Transparent Pricing – We believe in honest pricing with no hidden fees. Our goal is to provide high-quality service at competitive rates.",
          "Fast & Reliable Solutions – Whether it’s a leaky faucet, a clogged drain, or a burst pipe, we respond quickly and get the job done right the first time.",
          "Customer Satisfaction Guaranteed – Your trust is our priority. We ensure that every job is completed to the highest standards, leaving our customers 100% satisfied."
        ].map((text, index) => (
          <li key={index} className="flex items-start">
            <span className="text-green-500 text-xl mr-2">✔</span>
            {text}
          </li>
        ))}
      </ul>
      <h3 className="font-bold text-xl mt-6">Our Mission</h3>
      <p className="mt-2 text-lg">
        We aim to make plumbing stress-free by offering dependable and affordable services that keep your home and business running smoothly. Whether it’s a routine maintenance check, a major installation, or an emergency repair, we are here to help!
      </p>
      <p className="mt-4 font-bold text-lg">Need a Plumber? Call Us Today!</p>
      <ul className="list-disc list-inside mt-4 space-y-2">
        {[
          "24/7 Emergency Service",
          "Licensed & Certified Plumbers",
          "Affordable Pricing & No Hidden Fees",
          "100% Satisfaction Guarantee"
        ].map((text, index) => (
          <li key={index} className="flex items-start">
            <span className="text-green-500 text-xl mr-2">✔</span>
            {text}
          </li>
        ))}
      </ul>
    </div>
            </div>
      
      </section>
      
      <section className="container py-5" id="services">
        <h2 className="text-center mb-4">Our Services</h2>
        <div className="row">
          {[
            { title: "Plumbing Repairs", icon: "🚰" },
            { title: "Fixture Installation", icon: "🚿" },
            { title: "Leak Detection", icon: "💧" },
            { title: "Drain Cleaning", icon: "🌀" },
            { title: "Emergency Services", icon: "⚠️" },
            { title: "carpenter", icon: "⚠️" }
          ].map((service, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card text-center shadow p-4" id={service.title}>
                <h3>{service.icon}</h3>
                <h4>{service.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section id="contactUs">
        <ContactUs/>
      </section>
      {/* Footer */}
<Footer/>
    </>
  );
};

export default Home;
