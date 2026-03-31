const Session = require("../models/Session");

exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.getAll();
    res.status(200).json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.getById(req.params.id);
    if (!session)
      return res
        .status(404)
        .json({ success: false, error: "Session not found" });
    res.status(200).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createSession = async (req, res) => {
  try {
    const { name, start_date, end_date } = req.body;
    const id = await Session.create(name, start_date, end_date);
    res.status(201).json({ success: true, message: "Session created", id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { name, start_date, end_date } = req.body;
    await Session.update(req.params.id, name, start_date, end_date);
    res.status(200).json({ success: true, message: "Session updated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    await Session.delete(req.params.id);
    res.status(200).json({ success: true, message: "Session deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.activateSession = async (req, res) => {
  try {
    await Session.activate(req.params.id);
    res.status(200).json({ success: true, message: "Session Activated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
