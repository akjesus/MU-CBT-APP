const ExamDepartment = require("../models/ExamDepartment");

exports.getDepartmentsByExam = async (req, res) => {
    try {
        const examId = req.params.exam_id;
        const departments = await ExamDepartment.getByExamId(examId);
        res.json(departments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.assignDepartment = async (req, res) => {
    try {
        const { department_id } = req.body;
        const examId = req.params.exam_id;
        const id = await ExamDepartment.assignDepartment(examId, department_id);
        res.status(201).json({ message: "Department assigned to exam", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.assignMultipleDepartments = async (req, res) => {
    try {
      const { department_ids } = req.body; // Expecting an array of department IDs
      const examId = req.params.exam_id;
      console.log("Assigning departments to exam:", examId, department_ids);
      await ExamDepartment.removeAllByExam(examId); // Clear existing assignments
      if (!Array.isArray(department_ids) || department_ids.length === 0) {
        return res.status(400).json({ error: "Invalid department_ids format" });
      }

      const insertPromises = department_ids.map((departmentId) =>
        ExamDepartment.assignDepartment(examId, departmentId)
      );

      await Promise.all(insertPromises);

      res
        .status(201)
        .json({ message: "Departments assigned to exam successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeDepartment = async (req, res) => {
    try {
        const { exam_id, department_id } = req.params;
        await ExamDepartment.removeDepartment(exam_id, department_id);
        res.json({ message: "Department removed from exam" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeAllByExam = async (req, res) => {
    try {
        const examId = req.params.exam_id;
        await ExamDepartment.removeAllByExam(examId);
        res.json({ message: "All departments removed from exam" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
