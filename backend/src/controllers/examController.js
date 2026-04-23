const Exam = require("../models/Exam");
const ExamDepartment = require("../models/ExamDepartment");
const db = require("../config/database");

exports.getAllExams = async (req, res) => {
  try {
    const exams = await Exam.getAll();
    res.status(200).json({ success: true, exams });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllExamsWithCourseSession = async (req, res) => {
  try {
    const { course_id, session_id } = req.query;

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
    const [rows] = await db.query(sql, params);
    res.status(200).json({success: true, exams: rows});
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

  const {department_id} = req.body.exam;
  try {
    const id = await Exam.create(req.body.exam);
    for (const departmentId of department_id) {
      await ExamDepartment.assignDepartment(id, departmentId);
    }
    res.status(201).json({ success: true, message: "Exam created", id });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.activateExam = async (req, res) => {
  try {
    const active = await Exam.activateExam(req.params.id);
    res.status(201).json({ active });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

exports.removeAllQuestionsFromExam = async (req, res) => {
  const { id } = req.params;
  try {
    const [row] = await db.query(
      `DELETE FROM exam_questions WHERE exam_id = ?`,
      [id],
    );
    if (row?.affectedRows == 0)
      return res.json({ message: "Alert! No question for this exam" });
    res.json({ message: `All questions removed from exam successfully` });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};

exports.updateExam = async (req, res) => {
  const payload = req.body.exam;
  const id = req.params.id;
  const updateColumns = [];
  const updateValues = [];
  delete payload.course_name;
  delete payload.course_code;
  delete payload.course_level;
  delete payload.session_name;
  delete payload.created_at;
  delete payload.updated_at;
  delete payload.departments;
  Object.keys(payload).forEach((key) => {
    if (
      payload[key] !== undefined &&
      payload[key] !== null &&
      payload[key] !== 0 &&
      payload[key] !== ""
    ) {
      updateColumns.push(`${key}`);
      updateValues.push(payload[key]);
    }
  });

  try {
    await Exam.updateNewExam(id, updateColumns, updateValues);
    await ExamDepartment.removeAllByExam(id);
    for (const departmentId of payload.department_id) {
      await ExamDepartment.assignDepartment(id, departmentId);
    }
    res.status(200).json({ message: "Exam updated" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    await Exam.delete(req.params.id);
    await ExamDepartment.removeAllByExam(req.params.id);
    res.json({ message: "Exam deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllActiveExams = async (req, res) => {
  try {
    const exams = await Exam.getAllActiveExams();
    res.json(exams);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
};
