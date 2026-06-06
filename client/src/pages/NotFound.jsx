import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => (
  <div style={{ textAlign: "center", marginTop: "10vh" }}>
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <Link to="/admin/dashboard" style={{ color: "#2C2C78", textDecoration: "underline", fontWeight: "bold" }}>
      Go back to Dashboard
    </Link>
  </div>
);

export default NotFound;
