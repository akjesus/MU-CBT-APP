const StudentCourse = require("../models/StudentCourse");

exports.getCoursesByStudent = async (req, res) => {
    try {
        const studentId = req.params.student_id;
        const courses = await StudentCourse.getCoursesByStudent(studentId);
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStudentsByCourse = async (req, res) => {
    try {
        const courseId = req.params.course_id;
        const students = await StudentCourse.getStudentsByCourse(courseId);
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.assignStudentToCourse = async (req, res) => {
    try {
        const { student_id, course_id } = req.body;
        const id = await StudentCourse.assignStudentToCourse(student_id, course_id);
        res.status(201).json({ message: "Student assigned to course successfully", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeStudentFromCourse = async (req, res) => {
    try {
        const { student_id, course_id } = req.body;
        await StudentCourse.removeStudentFromCourse(student_id, course_id);
        res.json({ message: "Student removed from course successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.removeAllCoursesByStudent = async (req, res) => {
    try {
        const studentId = req.params.student_id;
        await StudentCourse.removeAllCoursesByStudent(studentId);
        res.json({ message: "All courses removed for the student" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
