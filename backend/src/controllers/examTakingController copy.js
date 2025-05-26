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
        const { student_id, exam_id } = req.params;
        const { responses, score } = req.body;

        // Check if student has already attempted
        const hasAttempted = await ExamTaking.hasAttemptedExam(student_id, exam_id);
        if (hasAttempted) {
            return res.status(403).json({ error: "You have already taken this exam." });
        }

        await ExamTaking.submitExam(student_id, exam_id, responses, score);
        res.json({ message: "Exam submitted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
