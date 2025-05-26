const db = require("../config/database");
const fs = require("fs");
const csv = require("csv-parser");

class StudentBulkUpload {
    static async importStudents(filePath) {
        return new Promise((resolve, reject) => {
            const students = [];

            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", (row) => {
                    students.push([
                        row.department_id,
                        row.level_id,
                        row.registration_number,
                        row.first_name,
                        row.last_name,
                        row.email,
                        row.username,
                        row.password, // Ideally, hash passwords before storing
                        row.photo,
                        new Date(), // created_at
                        new Date()  // updated_at
                    ]);
                })
                .on("end", async () => {
                    try {
                        if (students.length === 0) {
                            return reject(new Error("CSV file is empty or incorrectly formatted."));
                        }

                        await db.query(
                            `INSERT INTO students (department_id, level_id, registration_number, first_name, last_name, email, username, password, photo, created_at, updated_at) 
                             VALUES ?`,
                            [students]
                        );

                        resolve({ message: "Students imported successfully", count: students.length });
                    } catch (err) {
                        reject(err);
                    }
                })
                .on("error", (err) => reject(err));
        });
    }
}

module.exports = StudentBulkUpload;
