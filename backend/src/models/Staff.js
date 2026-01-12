const db = require("../config/database");
const bcrypt = require("bcryptjs");

class Staff {
    static async getAll() {
        const [rows] = await db.query(
            `SELECT staff.id, staff.role, staff.first_name, staff.last_name, staff.email, 
                    staff.username, staff.photo, staff.phone, staff.address, 
                    staff.department_id, departments.name AS department_name, 
                    faculties.name AS faculty_name
             FROM staff
             LEFT JOIN departments ON staff.department_id = departments.id
             LEFT JOIN faculties ON departments.faculty_id = faculties.id`
        );
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query(
            `SELECT staff.id, staff.role, staff.first_name, staff.last_name, staff.email, 
                    staff.username, staff.photo, staff.phone, staff.address, 
                    staff.department_id, departments.name AS department_name, 
                    faculties.name AS faculty_name
             FROM staff
             LEFT JOIN departments ON staff.department_id = departments.id
             LEFT JOIN faculties ON departments.faculty_id = faculties.id
             WHERE staff.id = ?`,
            [id]
        );
        return rows[0];
    }

    static async getByUsername(username) {
        const [rows] = await db.query("SELECT * FROM staff WHERE username = ?", [username]);
        return rows[0];
    }

    static async create(role, department_id, first_name, last_name, email, username, password, photo, phone, address) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            "INSERT INTO staff (role, department_id, first_name, last_name, email, username, password, photo, phone, address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
            [role, department_id, first_name, last_name, email, username, hashedPassword, photo, phone, address]
        );
        return result.insertId;
    }

    static async update(id, role, department_id, first_name, last_name, email, username, photo, phone, address) {
        await db.query(
            "UPDATE staff SET role = ?, department_id = ?, first_name = ?, last_name = ?, email = ?, username = ?, photo = ?, phone = ?, address = ?, updated_at = NOW() WHERE id = ?",
            [role, department_id, first_name, last_name, email, username, photo, phone, address, id]
        );
    }

    static async delete(id) {
        await db.query("DELETE FROM staff WHERE id = ?", [id]);
    }

    static async verifyPassword(inputPassword, storedPassword) {
        return await bcrypt.compare(inputPassword, storedPassword);
    }
}

module.exports = Staff;
