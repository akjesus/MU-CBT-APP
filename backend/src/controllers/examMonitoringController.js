const ExamMonitoring = require("../models/ExamMonitoring");

exports.getActiveExamSessions = async (req, res) => {
  const { exam_id } = req.params;
  try {
    const sessions = await ExamMonitoring.getActiveExamSessions(exam_id);
    res.status(200).json({ success: true, sessions });
  } catch (error) {
    console.error("Error fetching active exam sessions:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateExamSession = async (req, res) => {
  const { matriculation_number, exam_id, responses, time_left } = req.body;
  try {
    await ExamMonitoring.updateExamSession(
      matriculation_number,
      exam_id,
      responses,
      time_left,
    );
    res
      .status(200)
      .json({ success: true, message: "Exam session updated successfully" });
  } catch (error) {
    console.error("Error updating exam session:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createExamMonitoringSession = async (req, res) => {
  const { matriculation_number, exam_id, responses, time_left } = req.body;
  try {
    const existingSessions = await ExamMonitoring.getExamSession(
      matriculation_number,
      exam_id,
    );

    if (existingSessions) {
      return res.status(219).json({
        message:
          "An active exam session already exists for this student and exam.",
      });
    }

    const sessionId = await ExamMonitoring.createExamMonitoringSession(
      matriculation_number,
      exam_id,
      responses,
      time_left,
    );
    res.json({
      id: sessionId,
      message: "Exam monitoring session created successfully",
    });
  } catch (error) {
    console.error("Error creating exam monitoring session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.endExamSession = async (req, res) => {
  const { matriculation_number, exam_id } = req.body;
  try {
    await ExamMonitoring.endExamSession(matriculation_number, exam_id);
    res.json({ message: "Exam session ended successfully" });
  } catch (error) {
    console.error("Error ending exam session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getExamSession = async (req, res) => {
  const { exam_id, matriculation_number } = req.body;
  try {
    const session = await ExamMonitoring.getExamSession(
      matriculation_number,
      exam_id,
    );
    if (!session) {
      return res
        .status(204)
        .json({ success: false, message: "No active exam session found" });
    }
    res.status(200).json({ success: true, session });
  } catch (error) {
    console.error("Error fetching exam session:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const students = await ExamMonitoring.getStudents(parseInt(id));
    if (students.length === 0) {
      return res
        .status(204)
        .json({ success: false, message: "No students found for this exam" });
    }
    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error("Error fetching students for exam:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
