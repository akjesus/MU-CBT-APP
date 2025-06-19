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
        console.log(err)
        res.status(500).json({ error: err.message });
    }
};

exports.activateExam = async (req, res) => {
  try {
    const id = await Exam.activateExam(req.params.id);
    res.status(201).json({ message: "Exam activated", id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

exports.removeAllQuestionsFromExam = async (req, res) => {
  const { id } = req.params;
  try {
    const [row] = await db.query(`DELETE FROM exam_questions WHERE exam_id = ?`, [id]);
    if (row?.affectedRows == 0)
      return res.json({ message: "Alert! No question for this exam" });
    res.json({ message: `All questions removed from exam successfully` });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};

exports.updateExam = async (req, res) => {
const payload = req.body;
delete payload.department_ids;
delete payload.examiners_ids;

const id = req.params.id;
const updateColumns = [];
const updateValues = [];

Object.keys(payload).forEach((key) => {
  if (
    payload[key] !== undefined &&
    payload[key] !== null &&
    payload[key] !== 0 &&
    payload[key] !==''
  ) {
    updateColumns.push(`${key}`);
    updateValues.push(payload[key]);
  }
});

try {
  await Exam.updateNewExam(id, updateColumns, updateValues);
  res.json({ message: "Exam updated" });
} catch (err) {
    console.log(err.message)
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
