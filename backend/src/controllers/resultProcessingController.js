const ResultProcessing = require("../models/ResultProcessing");

exports.autoGradeExam = async (req, res) => {
    try {
        const { student_id, exam_id } = req.params;
        const { responses } = req.body;

        const score = await ResultProcessing.autoGradeExam(student_id, exam_id, responses);
        res.json({ message: "Exam graded successfully", score });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStudentResults = async (req, res) => {
    try {
        const { student_id } = req.params;
        const results = await ResultProcessing.getStudentResults(student_id);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getExamResults = async (req, res) => {
    try {
        const { exam_id } = req.params;
        const results = await ResultProcessing.getExamResults(exam_id);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getDepartmentResults = async (req, res) => {
    try {
        const { department_id } = req.params;
        const results = await ResultProcessing.getDepartmentResults(department_id);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.exportExamResultsToCSV = async (req, res) => {
    try {
        const { exam_id } = req.params;
        const filePath = await ResultProcessing.exportExamResultsToCSV(exam_id);
        res.download(filePath);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
