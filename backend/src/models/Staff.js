const db = require("../config/database");
const bcrypt = require("bcryptjs");

class Staff {
  static async getAll() {
    const [rows] = await db.query(`SELECT * FROM staff`);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query(`SELECT * FROM staff WHERE id = ?`, [id]);
    return rows[0];
  }

  static async getByUsername(username) {
    const [rows] = await db.query("SELECT * FROM staff WHERE username = ?", [
      username,
    ]);
    return rows[0];
  }

  static async create(role, first_name, last_name, email, username) {
    const hashedPassword = await bcrypt.hash("staff1234", 10);
    const [result] = await db.query(
      "INSERT INTO staff (role, first_name, last_name, email, username, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
      [role, first_name, last_name, email, username, hashedPassword],
    );
    return result.insertId;
  }

  static async update(
    id,
    role,
    first_name,
    last_name,
    email,
    username,
  ) {
    await db.query(
      "UPDATE staff SET role = ?, first_name = ?, last_name = ?, email = ?, username = ?, updated_at = NOW() WHERE id = ?",
      [
        role,
        first_name,
        last_name,
        email,
        username,
        id,
      ],
    );
  }

  static async delete(id) {
    await db.query("DELETE FROM staff WHERE id = ?", [id]);
  }

  static async verifyPassword(inputPassword, storedPassword) {
    return await bcrypt.compare(inputPassword, storedPassword);
  }
  static async resetPassword(id) {
    const hashedPassword = await bcrypt.hash("staff1234", 10);
    await db.query(
      "UPDATE staff SET password = ?, updated_at = NOW() WHERE id = ?",
      [hashedPassword, id],
    );
  }
}
module.exports = Staff;
