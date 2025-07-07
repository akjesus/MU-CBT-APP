const Session = require("../models/Session");

exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.getAll();
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSessionById = async (req, res) => {
    try {
        const session = await Session.getById(req.params.id);
        if (!session) return res.status(404).json({ error: "Session not found" });
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createSession = async (req, res) => {
    try {
        const { name, start_date, end_date, is_active } = req.body;
        const id = await Session.create(name, start_date, end_date, is_active);
        res.status(201).json({ message: "Session created", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSession = async (req, res) => {
    try {
        const { name, start_date, end_date, is_active } = req.body;
        await Session.update(req.params.id, name, start_date, end_date, is_active);
        res.json({ message: "Session updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        await Session.delete(req.params.id);
        res.json({ message: "Session deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.activateSession = async (req, res) => {
  try {
    await Session.activate(req.params.id);
    res.json({ message: "Session Activated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActiveSession = async (req, res) => {
  try {
    const session = await Session.getActiveSession();
    res.json([session]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
  