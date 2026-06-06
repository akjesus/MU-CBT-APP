const ExamTaking = require("../models/ExamTaking");
const {signAttendance} = require ("./attendanceController");
const db = require("../config/database");

exports.checkEligibility = async (req, res) => {
  try {
    const { student_id, exam_id } = req.params;
    const hasAttempted = await ExamTaking.hasAttemptedExam(student_id, exam_id);
    if (hasAttempted) {
      return res.status(200).json({
        code: 304,
        message: "You have already taken this exam.",
        success: false,
      });
    }
    return res.json({
      message: "You are eligible to take this exam.",
      success: true,
    });
  } catch (err) {
    console.log("Error in checkEligibility:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getExamQuestions = async (req, res) => {
  try {
    const { exam_id } = req.params;
    const questions = await ExamTaking.getExamQuestions(exam_id);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitExam = async (req, res) => {
  try {
    const { exam_id, student_id } = req.params;

    // Check if student has already attempted
    const hasAttempted = await ExamTaking.hasAttemptedExam(student_id, exam_id);
    if (hasAttempted) {
      return res
        .status(403)
        .json({ error: "You have already taken this exam." });
    }

    const { responses } = req.body;
    if (!responses) {
      return res.status(400).json({ error: "No responses provided." });
    }

    const [questions] = await db.query(
      `SELECT id AS question_id, correct_option, score_obtainable
         FROM questions
         WHERE id IN (
           SELECT question_id FROM exam_questions WHERE exam_id = ?
         )`,
      [exam_id],
    );

    if (!questions || questions.length === 0) {
      return res
        .status(404)
        .json({ error: "No questions found for this exam." });
    }

    // 2) For each question, check if user response matches the correct_option.
    let totalScore = 0;
    questions.forEach((q) => {
      const userAnswer = responses[q.question_id];
      // Convert score_obtainable to a real number
      const questionScore = parseFloat(q.score_obtainable) || 0;

      if (userAnswer && userAnswer === q.correct_option) {
        totalScore += questionScore;
      }
    });
    await db.query(
      `INSERT INTO results (student_id, exam_id, score, responses, status, start_time, submitted_time,
                              active_duration, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'completed', NOW(), NOW(), 0, NOW(), NOW())`,
      [student_id, exam_id, totalScore, JSON.stringify(responses)],
    );

    await db.query(
      `
      UPDATE exam_monitoring
      SET time_left = 0, updated_at = NOW(), responses = NULL
      WHERE student_id = ? AND exam_id = ?`,
      [student_id, exam_id],
    );
    res.json({
      message: "Exam submitted and auto-graded successfully!",
      finalScore: totalScore,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

//controller function to take in bulk student responses as array and submit
exports.submitBulkExam = async (req, res) => {
  try {
    const { exam_id } = req.params;
    const studentResponses = req.body;
    if (!Array.isArray(studentResponses) || studentResponses.length === 0) {
      return res.status(400).json({ error: "Invalid request format." });
    }

    // Process each student's responses
    for (const { student_id, responses } of studentResponses) {
      // Check if student has already attempted
      const hasAttempted = await ExamTaking.hasAttemptedExam(
        student_id,
        exam_id,
      );
      if (hasAttempted) {
        continue; // Skip this student if they have already taken the exam
      }

      // 1) Fetch all relevant questions for this exam from the DB,
      //    including their correct_option and score_obtainable.
      const [questions] = await db.query(
        `SELECT id AS question_id, correct_option, score_obtainable
         FROM questions
         WHERE id IN (
           SELECT question_id FROM exam_questions WHERE exam_id = ?
         )`,
        [exam_id],
      );

      if (!questions || questions.length === 0) {
        continue; // Skip this student if no questions found
      }

      // 2) For each question, check if user response matches the correct_option.
      let totalScore = 0;
      questions.forEach((q) => {
        const userAnswer = responses[q.question_id];
        // Convert score_obtainable to a real number
        const questionScore = parseFloat(q.score_obtainable) || 0;

        if (userAnswer && userAnswer === q.correct_option) {
          totalScore += questionScore;
        }
      });

      await db.query(
        `INSERT INTO results (student_id, exam_id, score, responses, status, start_time, submitted_time,
                              active_duration, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'completed', NOW(), NOW(), 0, NOW(), NOW())`,
        [student_id, exam_id, totalScore, JSON.stringify(responses)],
      );
    }

    return true
    } catch (err) {
    console.error(err);
    console.log;
    res.status(500).json({ error: err.message });
  }
};

exports.endExam = async (req, res) => {
  const { examId } = req.params;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      `
            UPDATE exams
            SET status='completed'
            WHERE id=?
            `,
      [examId],
    );

    // active students
    const [students] = await connection.query(
      `
                SELECT student_id, responses
                FROM exam_monitoring
                WHERE exam_id=?
                AND status='in_progress'
                `,
      [examId],
    );
    for (const student of students) {
      await calculateResult(examId, student.student_id, student.responses);
      await signAttendance(student.student_id, examId);
    }

    await connection.query(
      `
            UPDATE exam_monitoring
            SET
            status='submitted',
            time_left=0, responses=NULL, updated_at=NOW()
            WHERE exam_id=?
            `,
      [examId],
    );

    await connection.commit();
    return res.json({
      success: true,
      submitted: students.length,
    });
  } catch (error) {
    await connection.rollback();
    console.log(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

const calculateResult = async (exam_id, student_id, responses) => {
  try {
    const hasAttempted = await ExamTaking.hasAttemptedExam(student_id, exam_id);
    if (hasAttempted) {
      return 
    }

    const [questions] = await db.query(
      `SELECT id AS question_id, correct_option, score_obtainable
         FROM questions
         WHERE id IN (
           SELECT question_id FROM exam_questions WHERE exam_id = ?
         )`,
      [exam_id],
    );

    if (!questions || questions.length === 0) {
      return res
        .status(404)
        .json({ error: "No questions found for this exam." });
    }

    // 2) For each question, check if user response matches the correct_option.
    let totalScore = 0;
    questions.forEach((q) => {
      const userAnswer = responses[q.question_id];
      const questionScore = parseFloat(q.score_obtainable) || 0;

      if (userAnswer && userAnswer === q.correct_option) {
        totalScore += questionScore;
      }
    });
    await db.query(
      `INSERT INTO results (student_id, exam_id, score, responses, status, start_time, submitted_time,
                              active_duration, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'completed', NOW(), NOW(), 0, NOW(), NOW())`,
      [student_id, exam_id, totalScore, JSON.stringify(responses)],
    );

    await db.query(
      `
      UPDATE exam_monitoring
      SET time_left = 0, updated_at = NOW(), responses = NULL
      WHERE student_id = ? AND exam_id = ?`,
      [student_id, exam_id],
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
