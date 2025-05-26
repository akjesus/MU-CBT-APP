const db = require("../config/database");

class Course {
    static async getAll() {
        const sql = `
            SELECT 
                c.*, 
                d.name AS department_name,
                d.id AS department_id,
                l.name AS level_name,
                l.id AS level_id
            FROM courses c
            LEFT JOIN departments d ON c.department_id = d.id
            LEFT JOIN levels l ON c.level_id = l.id
            ORDER BY c.code;
        `;
    
        const [rows] = await db.query(sql);
        return rows;
    }
    
    static async getById(id) {
        const [rows] = await db.query("SELECT * FROM courses WHERE id = ?", [id]);
        return rows[0];
    }

    static async create(department_id, level_id, semester_id, name, code, credit_load, level) {
        const [result] = await db.query(
            "INSERT INTO courses (department_id, level_id, semester_id, name, code, credit_load, level) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [department_id, level_id, semester_id, name, code, credit_load, level]
        );
        return result.insertId;
    }

    static async update(id, department_id, level_id, semester_id, name, code, credit_load, level) {
        await db.query(
            "UPDATE courses SET department_id = ?, level_id = ?, semester_id = ?, name = ?, code = ?, credit_load = ?, level = ? WHERE id = ?",
            [department_id, level_id, semester_id, name, code, credit_load, level, id]
        );
    }

    static async delete(id) {
        await db.query("DELETE FROM courses WHERE id = ?", [id]);
    }
}

module.exports = Course;
