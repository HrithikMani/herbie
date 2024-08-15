import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';  // Import the navbar-specific CSS
import logo from '../assets/logos/herbie128.png';  // Import the logo image

const Navbar = () => {
  return (
    <nav id="main-navbar" className="navbar navbar-expand-lg navbar-light bg-light custom-navbar">
      <Link id="navbar-brand" className="navbar-brand" to="/">
        <img src={logo} alt="Herbie Logo" height="40" />
      </Link>
     
      <button id="navbar-toggler" className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul id="navbar-links" className="navbar-nav">
          <li id="nav-item-home" className="nav-item">
            <Link id="nav-link-home" className="nav-link" to="/">Home</Link>
          </li>
          <li id="nav-item-documentation" className="nav-item">
            <Link id="nav-link-documentation" className="nav-link" to="/documentation">Documentation</Link>
          </li>
          <li id="nav-item-github" className="nav-item">
            <a id="nav-link-github" className="nav-link" href="https://github.com/mieweb/herbie">GitHub</a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
