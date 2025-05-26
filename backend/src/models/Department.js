const db = require("../config/database");

class Department {
    static async getAll() {
        const sql = `
            SELECT 
                d.*, 
                f.name AS faculty_name,
                f.id AS faculty_id
            FROM departments d
            LEFT JOIN faculties f ON d.faculty_id = f.id
            ORDER BY f.name, d.name;
        `;
    
        const [rows] = await db.query(sql);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query("SELECT * FROM departments WHERE id = ?", [id]);
        return rows[0];
    }

    static async create(faculty_id, name) {
        const [result] = await db.query(
            "INSERT INTO departments (faculty_id, name) VALUES (?, ?)",
            [faculty_id, name]
        );
        return result.insertId;
    }

    static async update(id, faculty_id, name) {
        await db.query(
            "UPDATE departments SET faculty_id = ?, name = ? WHERE id = ?",
            [faculty_id, name, id]
        );
    }

    static async delete(id) {
        await db.query("DELETE FROM departments WHERE id = ?", [id]);
    }
}

module.exports = Department;
