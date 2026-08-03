const EligibleExams = require("../models/EligibleExams");

exports.getEligibleExams = async (req, res) => {
  try {
    const studentId = req.params.student_id;
    const exams = await EligibleExams.getEligibleExams(studentId);

    if (exams.length === 0) {
      return res
        .status(204)
        .json({ message: "You have no current exam, check back later" });
    }
    return res.status(200).json({ success: true, exams, code: 200 });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ error: err.message });
  }
};
