const Exam = require("../models/Exam");
const db = require("../config/database");


exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.getAll();
        //const exams = await Exam.getAllWithDepartments();
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllExamsWithCourseSession = async (req, res) => {
    try {
      const { course_id, session_id } = req.query; // e.g. /api/exams?course_id=5&session_id=2
  
      let sql = `
        SELECT e.*
        FROM exams e
        WHERE 1=1
      `;
      const params = [];
  
      if (course_id) {
        sql += " AND e.course_id = ?";
        params.push(course_id);
      }
  
      if (session_id) {
        sql += " AND e.session_id = ?";
        params.push(session_id);
      }
  
      // Optionally order by start_time or exam_name, etc.
      sql += " ORDER BY e.start_time DESC";
  
      // Or, if you have a separate model function, do:
      // const exams = await Exam.getAllFiltered(course_id, session_id);
      // But for inline, we query directly here:
  
      const [rows] = await db.query(sql, params);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

exports.getExamById = async (req, res) => {
    try {
        const exam = await Exam.getById(req.params.id);
        if (!exam) return res.status(404).json({ error: "Exam not found" });
        res.json(exam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getQuestions = async (req, res) => {
    try {
        const exam = await Exam.getExamQuestions(req.params.id);
        if (!exam) return res.status(404).json({ error: "Exam not found" });
        res.json(exam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createExam = async (req, res) => {
    try {
        const id = await Exam.create(req.body);
        res.status(201).json({ message: "Exam created", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateExam = async (req, res) => {
    try {
        await Exam.update(req.params.id, req.body);
        res.json({ message: "Exam updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteExam = async (req, res) => {
    try {
        await Exam.delete(req.params.id);
        res.json({ message: "Exam deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
