const Student = require("../models/Student");
const db = require("../config/database");
const jwt = require("jsonwebtoken");

exports.getAllStudents = async (req, res) => {
    try {
        const [students] = await db.query(
            `SELECT students.id, students.registration_number, students.first_name, students.last_name,
                    students.email, students.username, students.photo, students.department_id, departments.name AS department_name, 
                    students.level_id, levels.name AS level_name, faculties.name AS faculty_name
             FROM students
             JOIN levels ON students.level_id = levels.id
             JOIN departments ON students.department_id = departments.id
             JOIN faculties ON departments.faculty_id = faculties.id`
        );

        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getStudentById = async (req, res) => {
    try {
        const studentId = req.params.id;
        const [students] = await db.query(
            `SELECT students.id, students.registration_number, students.first_name, students.last_name,
                    students.email, students.username, students.photo, students.department_id, departments.name AS department_name, 
                    students.level_id, levels.name AS level_name, faculties.name AS faculty_name
             FROM students
             JOIN levels ON students.level_id = levels.id
             JOIN departments ON students.department_id = departments.id
             JOIN faculties ON departments.faculty_id = faculties.id
             WHERE students.id = ?`,
            [studentId]
        );

        if (students.length === 0) return res.status(404).json({ error: "Student not found" });

        res.json(students[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.createStudent = async (req, res) => {
    try {
        const { department_id, level_id, registration_number, first_name, last_name, email, username, password, photo } = req.body;
        console.log(req.body)
        const id = await Student.create(department_id, level_id, registration_number, first_name, last_name, email, username, password, photo);
        res.status(201).json({ message: "Student created", id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { department_id, level_id, first_name, last_name, email, username, password, photo } = req.body;
        await Student.update(req.params.id, department_id, level_id, first_name, last_name, email, username, password, photo);
        res.json({ message: "Student updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        await Student.delete(req.params.id);
        res.json({ message: "Student deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.studentLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        // const student = await Student.getByUsername(username);
        const student = await Student.getByRegNumberOrEmail(username);
        if (!student)
          return res.status(401).json({ error: "Invalid Email/Matric Number" });

        /*
        const isValidPassword = await Student.verifyPassword(password, student.password);
        if (!isValidPassword) return res.status(401).json({ error: "Invalid credentials" });
        */
        if (password !== student.password) {
          return res.status(401).json({ error: "Invalid Password" });
        }

        const token = jwt.sign({ id: student.id, username: student.username }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ message: "Login successful", token, user: student });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
