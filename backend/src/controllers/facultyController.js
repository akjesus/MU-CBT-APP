const Faculty = require("../models/Faculty");

exports.getAllFaculties = async (req, res) => {
    try {
        const faculties = await Faculty.getAll();
        if (!faculties || faculties.length === 0) {
            return res.status(404).json({ error: "No faculties found" });
        }
        res.json(faculties);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFacultyById = async (req, res) => {
    try {
        const faculty = await Faculty.getById(req.params.id);
        if (!faculty) return res.status(404).json({ error: "Faculty not found" });
        res.json(faculty);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createFaculty = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Faculty name is required" });
        const id = await Faculty.create(name);
        res.status(201).json({ message: "Faculty created", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateFaculty = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Faculty name is required" });
        await Faculty.update(req.params.id, name);
        res.json({ message: "Faculty updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteFaculty = async (req, res) => {
    try {
        await Faculty.delete(req.params.id);
        res.json({ message: "Faculty deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
