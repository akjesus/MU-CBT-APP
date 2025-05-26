const CarryoverCourse = require("../models/CarryoverCourse");

exports.getCarryoverCoursesByStudent = async (req, res) => {
    try {
        const studentId = req.params.student_id;
        const courses = await CarryoverCourse.getCarryoverCoursesByStudent(studentId);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStudentsByCarryoverCourse = async (req, res) => {
    try {
        const courseId = req.params.course_id;
        const students = await CarryoverCourse.getStudentsByCarryoverCourse(courseId);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.assignCarryoverCourse = async (req, res) => {
    try {
        const { student_id, course_id } = req.body;
        const id = await CarryoverCourse.assignCarryoverCourse(student_id, course_id);
        res.status(201).json({ message: "Carryover course assigned successfully", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeCarryoverCourse = async (req, res) => {
    try {
        const { student_id, course_id } = req.body;
        await CarryoverCourse.removeCarryoverCourse(student_id, course_id);
        res.json({ message: "Carryover course removed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeAllCarryoversByStudent = async (req, res) => {
    try {
        const studentId = req.params.student_id;
        await CarryoverCourse.removeAllCarryoversByStudent(studentId);
        res.json({ message: "All carryover courses removed for the student" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
