// controllers/authController.js
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/database");
let blacklistedTokens = new Set(); // Store invalid tokens (only works for in-memory)

const SECRET_KEY = "your_secret_key"; // Store in env file

exports.adminLogin = async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
  
      const admin = await Admin.findByUsername(username);
  
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      // Ensure password from DB is not null
      if (!admin.password) {
        return res.status(500).json({ error: "User record is corrupted. No password found." });
      }
      // Verify password against hashed password
      const passwordMatch = await bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      // Generate JWT token
      const token = jwt.sign({ id: admin.id, role: "Admin" }, SECRET_KEY, { expiresIn: "24h" });
  
      res.json({ message: "Login successful", token });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: err.message });
    }
  };


exports.createAdmin = async (req, res) => {
    try {
      const { firstName, lastName, email, username, password } = req.body;
  
      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }
  
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const [result] = await db.query(
        `INSERT INTO staff (role, first_name, last_name, email, username, password, created_at, updated_at)
         VALUES ('Admin', ?, ?, ?, ?, ?, NOW(), NOW())`,
        [firstName, lastName, email, username, hashedPassword]
      );
  
      res.status(201).json({ message: "Admin created successfully", id: result.insertId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

  exports.adminLogout = (req, res) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
          blacklistedTokens.add(token); // Add token to blacklist
      }
      res.json({ message: "Logout successful" });
  };
  
  exports.verifyToken = (req, res, next) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token || blacklistedTokens.has(token)) {
          return res.status(401).json({ error: "Unauthorized or logged out" });
      }
  
      jwt.verify(token, "your_secret_key", (err, user) => {
          if (err) {
              return res.status(403).json({ error: "Invalid token" });
          }
          req.user = user;
          next();
      });
  };