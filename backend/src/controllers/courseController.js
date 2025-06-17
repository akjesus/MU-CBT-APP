const Course = require("../models/Course");

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.getAll();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.getById(req.params.id);
        if (!course) return res.status(404).json({ error: "Course not found" });
        res.json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCourse = async (req, res) => {
    try {
        const { department_id, level_id, semester_id, name, code, credit_load, level } = req.body;
        const id = await Course.create(department_id, level_id, semester_id, name, code, credit_load, level);
        res.status(201).json({ message: "Course created", id });
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
};

exports.updateCourse = async (req, res) => {
    try {
        const { department_id, level_id, semester_id, name, code, credit_load, level } = req.body;
        await Course.update(req.params.id, department_id, level_id, semester_id, name, code, credit_load, level);
        res.json({ message: "Course updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        await Course.delete(req.params.id);
        res.json({ message: "Course deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
