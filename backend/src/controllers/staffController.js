const Staff = require("../models/Staff");
const jwt = require("jsonwebtoken");

exports.getAllStaff = async (req, res) => {
    try {
        const staffList = await Staff.getAll();
        res.json(staffList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStaffById = async (req, res) => {
    try {
        const staff = await Staff.getById(req.params.id);
        if (!staff) return res.status(404).json({ error: "Staff not found" });
        res.json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createStaff = async (req, res) => {
    try {
        const { role, department_id, first_name, last_name, email, username, password, photo, phone, address } = req.body;
        const id = await Staff.create(role, department_id, first_name, last_name, email, username, password, photo, phone, address);
        res.status(201).json({ message: "Staff created", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const { role, department_id, first_name, last_name, email, username, photo, phone, address } = req.body;
        await Staff.update(req.params.id, role, department_id, first_name, last_name, email, username, photo, phone, address);
        res.json({ message: "Staff updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        await Staff.delete(req.params.id);
        res.json({ message: "Staff deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.staffLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const staff = await Staff.getByUsername(username);
        if (!staff) return res.status(401).json({ error: "Invalid credentials" });

        const isValidPassword = await Staff.verifyPassword(password, staff.password);
        if (!isValidPassword) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: staff.id, username: staff.username, role: staff.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
