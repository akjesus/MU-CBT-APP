// controllers/examExaminerController.js
const ExamExaminer = require("../models/ExamExaminer");
const db = require("../config/database");

exports.getExaminersByExam = async (req, res) => {
  try {
    const { exam_id } = req.params;
    const examiners = await ExamExaminer.getExaminersByExam(exam_id);
    res.json(examiners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignMultipleExaminers = async (req, res) => {
  const { exam_id } = req.params;
  const { examiners_ids } = req.body; // Expecting an array of examiner IDs

  if (!examiners_ids || !Array.isArray(examiners_ids) || examiners_ids.length === 0) {
      return res.status(400).json({ error: "Invalid or empty examiners list" });
  }

  try {
      // Remove existing examiners for this exam before inserting new ones
      await db.query("DELETE FROM exam_examiners WHERE exam_id = ?", [exam_id]);

      // Insert new examiners
      const values = examiners_ids.map(examiner_id => [exam_id, examiner_id]);
      await db.query("INSERT INTO exam_examiners (exam_id, staff_id) VALUES ?", [values]);

      res.json({ message: "Examiners assigned successfully" });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
}


exports.getExamsByExaminer = async (req, res) => {
  try {
    const { staff_id } = req.params;
    const exams = await ExamExaminer.getExamsByExaminer(staff_id);
    res.json(exams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignExaminerToExam = async (req, res) => {
  try {
    const { staff_id, exam_id } = req.body;
    const id = await ExamExaminer.assignExaminerToExam(staff_id, exam_id);
    res.status(201).json({ message: "Examiner assigned successfully", id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeExaminerFromExam = async (req, res) => {
  try {
    const { staff_id, exam_id } = req.body;
    await ExamExaminer.removeExaminerFromExam(staff_id, exam_id);
    res.json({ message: "Examiner removed from exam successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeAllExaminersFromExam = async (req, res) => {
  try {
    const { exam_id } = req.params;
    await ExamExaminer.removeAllExaminersFromExam(exam_id);
    res.json({ message: "All examiners removed from this exam" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
