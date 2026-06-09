const Student = require("../models/Student");
const db = require("../config/database");
const bcrypt = require("bcrypt");

async function updateStudentPasswords() {
  const [students] = await db.query("SELECT id, registration_number FROM students");
  for (const student of students) {
    console.log(`resetting password for ${student.id}`)
    const hashedPassword = await bcrypt.hash(student.registration_number, 10);
    await db.query("UPDATE students SET password = ? WHERE id = ?", [
      hashedPassword,
      student.id,
    ]);
  }

  console.log("All student passwords updated successfully");
}

updateStudentPasswords();