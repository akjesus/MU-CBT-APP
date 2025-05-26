// models/Admin.js
const db = require("../config/database");
const bcrypt = require("bcrypt");

class Admin {
  static async findByUsername(username) {
    const [rows] = await db.query("SELECT * FROM staff WHERE username = ? AND role = 'Admin'", [username]);
    return rows.length ? rows[0] : null;
  }

  static async createAdmin(firstName, lastName, email, username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO staff (role, first_name, last_name, email, username, password, created_at, updated_at)
       VALUES ('Admin', ?, ?, ?, ?, ?, NOW(), NOW())`,
      [firstName, lastName, email, username, hashedPassword]
    );
    return result.insertId;
  }
}



module.exports = Admin;
