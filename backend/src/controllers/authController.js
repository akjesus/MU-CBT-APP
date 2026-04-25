// controllers/authController.js
const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/database");
let blacklistedTokens = new Set(); // Store invalid tokens (only works for in-memory)

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION ; 

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const admin = await Admin.findByUsername(username);

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Ensure password from DB is not null
    if (!admin.password) {
      return res
        .status(500)
        .json({ error: "User record is corrupted. No password found." });
    }
    // Verify password against hashed password
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin.id, role: "Admin" }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "User and password are required" });
    }
    const [rows] = await db.query(
      `SELECT * FROM staff WHERE email = ? or username = ?`,
      [username, username],
    );
    let user = rows[0];
    let isMatch;
    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      const [rows] = await db.query(
        `SELECT students.id as id,
          students.password as password, 
          students.first_name as first_name,
          students.last_name as last_name,
          students.email as email,
          students.role as role,
          students.registration_number as matriculation_number,
          departments.name as department,
          levels.name as level
          FROM students 
          JOIN departments on students.department_id = departments.id
          JOIN levels on students.level_id = levels.id
          WHERE registration_number = ? 
          or email = ?`,
        [username, username],
      );
      user = rows[0];
      if (!user) {
        return res.status(401).json({ message: "Invalid Username" });
      }
      isMatch = password === user.password ? true : false;
    }
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    user.password = undefined;
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRATION },
    );
    res.status(200).json({ success: true, token, user });
  } catch (err) {
    console.log(err);
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
      [firstName, lastName, email, username, hashedPassword],
    );

    res
      .status(201)
      .json({ message: "Admin created successfully", id: result.insertId });
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

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

exports.resetpassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
      return res
        .status(400)
        .json({ error: "Username and new password are required" });
    }

    const admin = await Admin.findByUsername(username);

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await db.query(
      `UPDATE staff SET password = ?, updated_at = NOW() WHERE id = ?`,
      [hashedPassword, admin.id],
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || blacklistedTokens.has(token)) {
    return res.status(401).json({ error: "Unauthorized or logged out" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};
