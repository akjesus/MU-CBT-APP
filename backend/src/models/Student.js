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

  static async getByUsername(username) {
    const [rows] = await db.query(`SELECT * FROM students WHERE email = ?`, [
      username,
    ]);
    return rows[0];
  }

  static async getByRegNumberOrEmail(regnumberoremail) {
    const [rows] = await db.query(
      `SELECT * FROM students WHERE LOWER(registration_number) = ? or email = ?`,
      [regnumberoremail.toLowerCase(), regnumberoremail]
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
    username,
    password,
    photo
  ) {
    //const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      "INSERT INTO students (department_id, level_id, registration_number, first_name, last_name, email, username, password, photo, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [
        department_id,
        level_id,
        registration_number,
        first_name,
        last_name,
        email,
        username,
        password,
        photo,
      ]
    );
    return result.insertId;
  }

  static async update(
    id,
    department_id,
    level_id,
    first_name,
    last_name,
    email,
    username,
    password,
    photo
  ) {
    // Base query (without password)
    let query = `
          UPDATE students
          SET department_id = ?,
              level_id = ?,
              first_name = ?,
              last_name = ?,
              email = ?,
              username = ?,
              photo = ?,
              updated_at = NOW()
        `;

    // Params for the placeholders in our SQL
    const params = [
      department_id,
      level_id,
      first_name,
      last_name,
      email,
      username,
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
}

module.exports = Student;
