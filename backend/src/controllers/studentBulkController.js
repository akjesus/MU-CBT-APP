const db = require("../config/database");
const StudentBulkUpload = require("../models/StudentBulkUpload");
const csvParser = require("csv-parser");
const stream = require("stream");
const fs = require("fs");

exports.bulkUploadStudents3 = async (req, res) => {
  const csvFile = req.files.file;

  try {
    if (!req.file && !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log(req.files.file);
    const result = await StudentBulkUpload.importStudents(req.files.file.path);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bulkUploadStudents = async (req, res) => {
  try {
    // Check if file is present
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    const csvFile = req.files.file;
    const bufferStream = new stream.PassThrough();
    bufferStream.end(csvFile.data);

    const studentsToImsert = []; // for student fields
    // We'll store them as arrays of [course_id, level_id, ... user_id], then link after

    bufferStream
      .pipe(csvParser())
      .on("data", (row) => {
        // Extract the fields from CSV row
        // We'll parse them carefully, assuming columns are consistent
        const {
          department_id,
          level_id,
          registration_number,
          first_name,
          last_name,
          email,
          username,
          password,
          photo,
        } = row;

        // We'll store this row data
        studentsToImsert.push({
          department_id,
          level_id,
          registration_number,
          first_name,
          last_name,
          email,
          username,
          password,
          photo,
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
               (department_id, level_id, registration_number, first_name, last_name, email, username,
                password, photo, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
              [
                qRow.department_id,
                qRow.level_id,
                qRow.registration_number,
                qRow.first_name,
                qRow.last_name,
                qRow.email,
                qRow.username,
                qRow.password,
                qRow.photo,
              ]
            );
            insertedCount++;

        }
        res.status(201).json({
          message: `${insertedCount} students successfully uploaded`,
        });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
