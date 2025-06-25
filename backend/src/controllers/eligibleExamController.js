const EligibleExams = require("../models/EligibleExams");

exports.getEligibleExams = async (req, res) => {
    try {
        const studentId = req.params.student_id;
        const exams = await EligibleExams.getEligibleExams(studentId);

        if (exams.length === 0) {
            return res.status(403).json({ message: "You have no current exam, check back later" });
        }

        res.json(exams);
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
};
