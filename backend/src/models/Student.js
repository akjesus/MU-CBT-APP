const db = require("../config/database");
const bcrypt = require("bcryptjs");

class Student {
  static async getAll() {
    const [rows] = await db.query("SELECT * FROM students");
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM students WHERE id = ?", [id]);
    return rows[0];
  }

  static async getByother_names(other_names) {
    const [rows] = await db.query(`SELECT * FROM students WHERE email = ?`, [
      other_names,
    ]);
    return rows[0];
  }

  static async getByRegNumberOrEmail(regnumberoremail) {
    const [rows] = await db.query(
      `SELECT * FROM students WHERE LOWER(registration_number) = ? or email = ?`,
      [regnumberoremail.toLowerCase(), regnumberoremail],
    );
    return rows[0];
  }

  static async create(
    department_id,
    level_id,
    registration_number,
    first_name,
    last_name,
    email,
    other_names,
  ) {
    const hashedPassword = await bcrypt.hash(registration_number, 10);
    const [result] = await db.query(
      `INSERT INTO students (department_id, level_id, registration_number, 
      first_name, last_name, other_names, email, password,  
      created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?,  NOW(), NOW())`,
      [
        department_id,
        level_id,
        registration_number,
        first_name,
        last_name,
        other_names,
        email,
        hashedPassword,
      ],
    );
    return result.insertId;
  }

  static async update(
    id,
    department_id,
    registration_number,
    level_id,
    first_name,
    last_name,
    email,
    other_names,
    password,
    photo,
  ) {
    // Base query (without password)
    let query = `
          UPDATE students
          SET department_id = ?,
              registration_number = ?,
              level_id = ?,
              first_name = ?,
              last_name = ?,
              email = ?,
              other_names = ?,
              photo = ?,
              updated_at = NOW()
        `;

    // Params for the placeholders in our SQL
    const params = [
      department_id,
      registration_number,
      level_id,
      first_name,
      last_name,
      email,
      other_names,
      photo,
    ];

    // If password is non-empty, include it in the query
    if (password) {
      query += ", password = ?";
      params.push(password);
    }

    // Finally, add the WHERE clause
    query += " WHERE id = ?";
    params.push(id);

    // Execute the built query
    await db.query(query, params);
  }

  static async delete(id) {
    await db.query("DELETE FROM students WHERE id = ?", [id]);
  }

  static async verifyPassword(inputPassword, storedPassword) {
    return await bcrypt.compare(inputPassword, storedPassword);
  }
  static async getByDepartmentAndLevel(departmentId, levelId) {
    const [rows] = await db.query(
      `SELECT students.id, students.registration_number, students.first_name, students.last_name,
                    students.email, students.other_names, students.photo, students.department_id, departments.name AS department_name, 
                    students.level_id, levels.name AS level_name, faculties.name AS faculty_name, faculties.id AS faculty_id
             FROM students  
                JOIN levels ON students.level_id = levels.id
                JOIN departments ON students.department_id = departments.id
                JOIN faculties ON departments.faculty_id = faculties.id
             WHERE students.department_id = ? AND students.level_id = ?`,
      [departmentId, levelId],
    );
    return rows;
  }
  static async resetPassword(studentId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE students SET password = ? WHERE id = ?", [
      hashedPassword,
      studentId,
    ]);
  }
}
module.exports = Student;
