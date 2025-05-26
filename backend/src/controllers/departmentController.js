const Department = require("../models/Department");

exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.getAll();
        res.json(departments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDepartmentById = async (req, res) => {
    try {
        const department = await Department.getById(req.params.id);
        if (!department) return res.status(404).json({ error: "Department not found" });
        res.json(department);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const { faculty_id, name } = req.body;
        const id = await Department.create(faculty_id, name);
        res.status(201).json({ message: "Department created", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateDepartment = async (req, res) => {
    try {
        const { faculty_id, name } = req.body;
        await Department.update(req.params.id, faculty_id, name);
        res.json({ message: "Department updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        await Department.delete(req.params.id);
        res.json({ message: "Department deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
