const db = require("../config/database");

class BlockList {
    static async getAll() {
        const sql = `
            SELECT blocklist.id AS id,CONCAT(students.first_name, ' ', students.last_name) AS student_name,
            blocklist.registration_number AS matric_no,
            exams.exam_name AS exam_name,
            levels.name AS level,
            departments.name AS department
            FROM blocklist 
            JOIN students  ON blocklist.registration_number = students.registration_number    
            JOIN exams ON blocklist.exam_id = exams.id
            JOIN levels ON students.level_id = levels.id
            JOIN departments ON students.department_id = departments.id
           `;
    
        const [rows] = await db.query(sql);
        return rows;
    }
    
    static async getById(id) {
        const [rows] = await db.query("SELECT * FROM blocklist WHERE id = ?", [id]);
        return rows[0];
    }

    static async create(registration_number, exam_id) {
        const [result] = await db.query(
            "INSERT INTO blocklist (registration_number, exam_id) VALUES (?, ?)",
            [registration_number, exam_id]
        );
        return result.insertId;
    }

    static async update(id, registration_number, exam_id) {
        await db.query(
            "UPDATE blocklist SET registration_number = ?, exam_id = ?, WHERE id = ?",
            [registration_number, exam_id, id]
        );
    }

    static async delete(id) {
        await db.query("DELETE FROM blocklist WHERE id = ?", [id]);
    }

    static async toggleBlock(registration_number, exam_id) {
        const [rows] = await db.query(
            "SELECT * FROM blocklist WHERE registration_number = ? AND exam_id = ?",
            [registration_number, exam_id]
        );

        if (rows.length > 0) {
            // If the student is already blocked, unblock them
            await db.query(
                "DELETE FROM blocklist WHERE registration_number = ? AND exam_id = ?",
                [registration_number, exam_id]
            );
            return { action: "unblocked" };
        } else {
            // If the student is not blocked, block them
            await db.query(
                "INSERT INTO blocklist (registration_number, exam_id) VALUES (?, ?)",
                [registration_number, exam_id]
            );
            return { action: "blocked" };
        }
    }
}

module.exports = BlockList;