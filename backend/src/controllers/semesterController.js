const Semester = require("../models/Semester");

exports.getAllSemesters = async (req, res) => {
    try {
        const semesters = await Semester.getAll();
        res.json(semesters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSemesterById = async (req, res) => {
    try {
        const semester = await Semester.getById(req.params.id);
        if (!semester) return res.status(404).json({ error: "Semester not found" });
        res.json(semester);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createSemester = async (req, res) => {
    try {
        const { session_id, name } = req.body;
        const id = await Semester.create(session_id, name);
        res.status(201).json({ message: "Semester created", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSemester = async (req, res) => {
    try {
        const { session_id, name } = req.body;
        await Semester.update(req.params.id, session_id, name);
        res.json({ message: "Semester updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSemester = async (req, res) => {
    try {
        await Semester.delete(req.params.id);
        res.json({ message: "Semester deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
