const ExamTaking = require("../models/ExamTaking");
const db = require("../config/database");

exports.checkEligibility = async (req, res) => {
    try {
        const { student_id, exam_id } = req.params;

        // Check if student is eligible
        const eligibility = await ExamTaking.checkEligibility(student_id, exam_id);
        if (!eligibility) {
            return res.status(403).json({ error: "You are not eligible for this exam or exam has not started." });
        }

        // Check if student has already attempted (if multiple attempts are not allowed)
        const hasAttempted = await ExamTaking.hasAttemptedExam(student_id, exam_id);
        if (hasAttempted) {
            return res.status(403).json({ error: "You have already taken this exam." });
        }

        res.json({ message: "You are eligible to take this exam.", exam: eligibility });
    } catch (err) {
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
            return res.status(403).json({ error: "You have already taken this exam." });
        }

      const { responses } = req.body; // e.g. { "7": "A", "8": "C" }
      if (!responses) {
        return res.status(400).json({ error: "No responses provided." });
      }
  
      // 1) Fetch all relevant questions for this exam from the DB,
      //    including their correct_option and score_obtainable.
      const [questions] = await db.query(
        `SELECT id AS question_id, correct_option, score_obtainable
         FROM questions
         WHERE id IN (
           SELECT question_id FROM exam_questions WHERE exam_id = ?
         )`,
        [exam_id]
      );
  
      if (!questions || questions.length === 0) {
        return res.status(404).json({ error: "No questions found for this exam." });
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
  
      // 3) Save the result in the `results` table (status=completed, etc.)
      //    We'll assume there's only one attempt. If multiple attempts are allowed,
      //    you'd handle that logic.
      await db.query(
        `INSERT INTO results (student_id, exam_id, score, responses, status, start_time, submitted_time,
                              active_duration, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'completed', NOW(), NOW(), 0, NOW(), NOW())`,
        [student_id, exam_id, totalScore, JSON.stringify(responses)]
      );
  
      // 4) Respond with a success message and the final score if you wish.
      res.json({
        message: "Exam submitted and auto-graded successfully!",
        finalScore: totalScore
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  };
