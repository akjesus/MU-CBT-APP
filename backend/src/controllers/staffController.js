const Staff = require("../models/Staff");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")

exports.getAllStaff = async (req, res) => {
  try {
    const staffList = await Staff.getAll();
    res.status(200).json({ success: true, staff: staffList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.getById(req.params.id);
    if (!staff) return res.status(404).json({ error: "Staff not found" });
    res.status(200).json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const { role, first_name, last_name, email, username, password } = req.body;
    const id = await Staff.create(
      role,
      first_name,
      last_name,
      email,
      username,
      password,
    );
    res.status(201).json({success: true, message: "Staff created", id });
  } catch (err) {
    console.log("Error creating staff:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const {
      role,
      first_name,
      last_name,
      email,
      username,
    } = req.body;
    await Staff.update(
      req.params.id,
      role,
      first_name,
      last_name,
      email,
      username,
    );
    const staff = await Staff.getAll();
    res.status(200).json({ success: true, staff });
  } catch (err) {
    console.log("Error updating staff:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    await Staff.delete(req.params.id);
    res.status(200).json({ success: true, message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.staffLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const staff = await Staff.getByUsername(username);
    if (!staff) return res.status(401).json({ error: "Invalid credentials" });

    const isValidPassword = await Staff.verifyPassword(
      password,
      staff.password,
    );
    if (!isValidPassword)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: staff.id, username: staff.username, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { username } = req.body;
    const staff = await Staff.getByUsername(username);
    if (!staff) return res.status(404).json({ error: "Staff not found" });
    await Staff.resetPassword(staff.id);
    res
      .status(200)
      .json({ success: true, message: "Password reset Successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    const staff = await Staff.getById(staffId);
    if (!staff) return res.status(404).json({ error: "Staff not found" });
    const isMatch = await bcrypt.compare(oldPassword, staff.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid old password" });
    await Staff.updatePassword(staffId, newPassword);
    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

