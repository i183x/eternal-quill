import React from "react";
import { Link } from "react-router-dom";
import "./styles/Navbar.css"; // We'll create this CSS file to style the navbar

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>Eternal Quill</h1>
      <ul className="nav-links">
        <li><Link to="/">Feed</Link></li>
        <li><Link to="/write">Write</Link></li>
        <li><Link to="/users">Users</Link></li>
        <li><Link to="/competitions">Competitions</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
