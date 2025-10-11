import React, { useEffect } from 'react';
import { FaKeyboard } from 'react-icons/fa';
import 'aos/dist/aos.css';
import AOS from 'aos';

const ShortcutsMenuItem = () => {

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease',
      once: true,
      offset: 50,
    });
  }, []);

  let role = localStorage.getItem('role');

  return (
    <>
    <br></br>
    <br></br>
    <br></br>
      {role === 'user' ? (
        <div className="container mt-5" data-aos="fade-up">
          <h3 className="mb-4 d-flex align-items-center">
            <FaKeyboard className="me-2" /> Keyboard Shortcuts
          </h3>

          <ul className="list-group">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Dashboard / Profile
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">P</kbd>
              </span>
            </li>

            <li className="list-group-item d-flex justify-content-between align-items-center">
              Services Available
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">B</kbd>
              </span>
            </li>

            <li className="list-group-item d-flex justify-content-between align-items-center">
              Saved Service
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">S</kbd>
              </span>
            </li>

            <li className="list-group-item d-flex justify-content-between align-items-center">
              Reviews & Rating
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">V</kbd>
              </span>
            </li>

            <li className="list-group-item d-flex justify-content-between align-items-center">
              Notifications
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">I</kbd>
              </span>
            </li>

            <li className="list-group-item d-flex justify-content-between align-items-center">
              Payment
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">Y</kbd>
              </span>
            </li>

            <li className="list-group-item d-flex justify-content-between align-items-center">
              Payment History
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">X</kbd>
              </span>
            </li>

            <li className="list-group-item d-flex justify-content-between align-items-center">
              Shortcuts
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">K</kbd>
              </span>
            </li>
          </ul>
        </div>
      ) : (
        <div className="container mt-5" data-aos="fade-up">
          <h3 className="mb-4 d-flex align-items-center">
            <FaKeyboard className="me-2" /> Keyboard Shortcuts
          </h3>

          <ul className="list-group">
            <li className="list-group-item d-flex justify-content-between align-items-center">
              Dashboard / Profile
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">P</kbd>
              </span>
            </li>

            <li className="list-group-item d-flex justify-content-between align-items-center">
              Add Service
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">B</kbd>
              </span>
            </li>

            <li className="list-group-item d-flex justify-content-between align-items-center">
              Booking Requests
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">S</kbd>
              </span>
            </li>

            <li className="list-group-item d-flex justify-content-between align-items-center">
              Reviews & Rating
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">V</kbd>
              </span>
            </li>

            <li className="list-group-item d-flex justify-content-between align-items-center">
              Notifications
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">I</kbd>
              </span>
            </li>

            <li className="list-group-item d-flex justify-content-between align-items-center">
              Payment History
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">X</kbd>
              </span>
            </li>

            <li className="list-group-item d-flex justify-content-between align-items-center">
              Shortcuts
              <span>
                <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
                <kbd className="bg-secondary px-2 rounded">K</kbd>
              </span>
            </li>
          </ul>
        </div>
      )}
    </>
  );
};

export default ShortcutsMenuItem;
