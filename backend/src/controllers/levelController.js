const Level = require("../models/Level");

exports.getAllLevels = async (req, res) => {
    try {
        const levels = await Level.getAll();
        res.json(levels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getLevelById = async (req, res) => {
    try {
        const level = await Level.getById(req.params.id);
        if (!level) return res.status(404).json({ error: "Level not found" });
        res.json(level);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createLevel = async (req, res) => {
    try {
        const { name } = req.body;
        const id = await Level.create(name);
        res.status(201).json({ message: "Level created", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateLevel = async (req, res) => {
    try {
        const { name } = req.body;
        await Level.update(req.params.id, name);
        res.json({ message: "Level updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteLevel = async (req, res) => {
    try {
        await Level.delete(req.params.id);
        res.json({ message: "Level deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
