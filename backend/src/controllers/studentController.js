const Student = require("../models/Student");
const db = require("../config/database");
const jwt = require("jsonwebtoken");
const csvParser = require("csv-parser");
const stream = require("stream");

exports.getAllStudents = async (req, res) => {
  try {
    const [students] = await db.query(
      `SELECT students.id, students.registration_number, students.first_name, students.last_name,
                    students.email, students.other_names, students.photo, students.department_id, departments.name AS department_name, 
                    students.level_id, levels.name AS level_name, faculties.name AS faculty_name
             FROM students
             JOIN levels ON students.level_id = levels.id
             JOIN departments ON students.department_id = departments.id
             JOIN faculties ON departments.faculty_id = faculties.id`,
    );

    res.json(students);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const studentId = req.params.id;
    const [students] = await db.query(
      `SELECT students.id, students.registration_number, students.first_name, students.last_name,
                    students.email, students.other_names, students.photo, students.department_id, departments.name AS department_name, 
                    students.level_id, levels.name AS level_name, faculties.name AS faculty_name
             FROM students
             JOIN levels ON students.level_id = levels.id
             JOIN departments ON students.department_id = departments.id
             JOIN faculties ON departments.faculty_id = faculties.id
             WHERE students.id = ?`,
      [studentId],
    );

    if (students.length === 0)
      return res.status(404).json({ error: "Student not found" });

    res.json(students[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const {
      department_id,
      level_id,
      registration_number,
      first_name,
      last_name,
      email,
      other_names,
    } = req.body;
    if (
      !department_id ||
      !level_id ||
      !registration_number ||
      !first_name ||
      !last_name ||
      !email
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const student = await Student.create(
      department_id,
      level_id,
      registration_number,
      first_name,
      last_name,
      email,
      other_names,
    );
    res.status(201).json({ message: "Student created", student });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const {
      department_id,
      registration_number,
      level_id,
      first_name,
      last_name,
      email,
      other_names,
      password,
      photo,
    } = req.body;
    await Student.update(
      req.params.id,
      department_id,
      registration_number,
      level_id,
      first_name,
      last_name,
      email,
      other_names,
      password,
      photo,
    );
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
    const { other_names, password } = req.body;
    // const student = await Student.getByother_names(other_names);
    const student = await Student.getByRegNumberOrEmail(other_names);
    if (!student)
      return res.status(401).json({ error: "Invalid Email/Matric Number" });

    /*
        const isValidPassword = await Student.verifyPassword(password, student.password);
        if (!isValidPassword) return res.status(401).json({ error: "Invalid credentials" });
        */
    if (password !== student.password) {
      return res.status(401).json({ error: "Invalid Password" });
    }

    const token = jwt.sign(
      { id: student.id, other_names: student.other_names },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.json({ message: "Login successful", token, user: student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentsByDepartmentAndLevel = async (req, res) => {
  try {
    const { departmentId, levelId } = req.params;
    const students = await Student.getByDepartmentAndLevel(
      departmentId,
      levelId,
    );
    res.status(200).json({ success: true, students });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bulkUploadStudents = async (req, res) => {
  try {
    // Check if file is present
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ error: "CSV file is required" });
    }
    console.log("Received file:", req.file.originalname);
    const csvFile = req.file;
    const bufferStream = new stream.PassThrough();
    bufferStream.end(csvFile.buffer);
    const studentsToImsert = [];
    bufferStream
      .pipe(csvParser())
      .on("data", (row) => {
        const {
          department_id,
          level_id,
          registration_number,
          first_name,
          last_name,
          email,
          other_names,
        } = row;

        // We'll store this row data
        studentsToImsert.push({
          department_id,
          level_id,
          registration_number,
          first_name,
          last_name,
          email,
          other_names,
          password: registration_number, // default password is reg number
        });
      })
      .on("end", async () => {
        if (!studentsToImsert.length) {
          return res
            .status(400)
            .json({ error: "No valid student data found in CSV" });
        }

        let insertedCount = 0;

        // We'll process each question row individually
        for (const qRow of studentsToImsert) {
          // Insert new question

          const [insertRes] = await db.query(
            `INSERT INTO students 
               (department_id, level_id, registration_number, first_name, last_name, email, other_names,
                password, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              qRow.department_id,
              qRow.level_id,
              qRow.registration_number,
              qRow.first_name,
              qRow.last_name,
              qRow.email,
              qRow.other_names,
              qRow.password,
            ],
          );
          insertedCount++;
        }
        res.status(201).json({
          success: true,
          message: `${insertedCount} students successfully uploaded`,
        });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
