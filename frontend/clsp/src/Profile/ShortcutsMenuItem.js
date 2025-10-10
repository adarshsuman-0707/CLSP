import React, { useState } from 'react';
import { CDBSidebarMenuItem } from 'cdbreact';
import { FaKeyboard } from 'react-icons/fa';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

const ShortcutsMenuItem = () => {

  const popover = (
    <Popover id="popover-shortcuts" className="bg-dark text-white">
      <Popover.Header as="h6" className="bg-dark text-white">Keyboard Shortcuts</Popover.Header>
      <Popover.Body className="bg-dark text-white">
        <ul className="list-unstyled mb-0">
          <li><kbd className="bg-secondary px-1 rounded">Ctrl</kbd> + <kbd className="bg-secondary px-1 rounded">D</kbd> : Dashboard/Profile</li>
          <li><kbd className="bg-secondary px-1 rounded">Ctrl</kbd> + <kbd className="bg-secondary px-1 rounded">R</kbd> : Reviews</li>
          <li><kbd className="bg-secondary px-1 rounded">Ctrl</kbd> + <kbd className="bg-secondary px-1 rounded">I</kbd> : Notifications</li>
          <li><kbd className="bg-secondary px-1 rounded">Ctrl</kbd> + <kbd className="bg-secondary px-1 rounded">S</kbd> : Saved Service</li>
          <li><kbd className="bg-secondary px-1 rounded">Ctrl</kbd> + <kbd className="bg-secondary px-1 rounded">A</kbd> : Add Service</li>
        </ul>
      </Popover.Body>
    </Popover>
  );

    return (<>
    <br></br>
    <br></br>
    <br></br>

    <div className="container mt-5">
      <h3 className="mb-4 d-flex align-items-center">
        <FaKeyboard className="me-2" /> Keyboard Shortcuts
      </h3>

      <ul className="list-group">
        <li className="list-group-item d-flex justify-content-between align-items-center">
          Dashboard / Profile
          <span>
            <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
            <kbd className="bg-secondary px-2 rounded">D</kbd>
          </span>
        </li>

        <li className="list-group-item d-flex justify-content-between align-items-center">
          Reviews
          <span>
            <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
            <kbd className="bg-secondary px-2 rounded">R</kbd>
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
          Saved Service
          <span>
            <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
            <kbd className="bg-secondary px-2 rounded">S</kbd>
          </span>
        </li>

        <li className="list-group-item d-flex justify-content-between align-items-center">
          Add Service
          <span>
            <kbd className="bg-secondary px-2 rounded">Ctrl</kbd> + 
            <kbd className="bg-secondary px-2 rounded">A</kbd>
          </span>
        </li>
      </ul>
    </div>
 </> );
};

export default ShortcutsMenuItem;
