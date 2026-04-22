const db = require("../config/database");

exports.getDashboardStats = async (req, res) => {
  try {
    // Fetch student count
    const [[students]] = await db.query("SELECT COUNT(*) as total FROM students");

    // Fetch active exam count
    const [[activeExams]] = await db.query("SELECT COUNT(*) as total FROM exams WHERE active = 1");

    // Fetch total exams created
    const [[totalExams]] = await db.query("SELECT COUNT(*) as total FROM exams");

    // Fetch average exam pass rate (if grading logic exists)
    const [[passRate]] = await db.query("SELECT ROUND(AVG(score), 2) as avg_pass_rate FROM results WHERE score >= 50");

    // Fetch staff count (excluding students)
    const [[staff]] = await db.query("SELECT COUNT(*) as total FROM staff WHERE role IN ('Admin', 'Examiner', 'Moderator')");

    // Fetch total questions in Question Bank
    const [[questionBank]] = await db.query("SELECT COUNT(*) as total FROM questions");

    // Fetch faculty name (optional)
    const [[faculty]] = await db.query("SELECT COUNT(*) as total FROM faculties");
    const [[courses]] = await db.query("SELECT COUNT(*) as total FROM courses");
    const [[departments]] = await db.query("SELECT COUNT(*) as total FROM departments");

    res.status(200).json({ success: true, data: {   
      students: students.total || 0,
      active_exams: activeExams.total || 0,
      total_exams: totalExams.total || 0,
      pass_rate: passRate.avg_pass_rate || 0,
      staff: staff.total || 0,
      questions: questionBank.total || 0,
      faculties: faculty.total || 0,
      courses: courses.total || 0,
      departments: departments.total || 0,
    }});
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

