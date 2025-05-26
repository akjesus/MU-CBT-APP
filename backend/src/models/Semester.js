const db = require("../config/database");

class Semester {
    static async getAll() {
        const [rows] = await db.query("SELECT * FROM semesters");
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query("SELECT * FROM semesters WHERE id = ?", [id]);
        return rows[0];
    }

    static async create(session_id, name) {
        const [result] = await db.query(
            "INSERT INTO semesters (session_id, name) VALUES (?, ?)",
            [session_id, name]
        );
        return result.insertId;
    }

    static async update(id, session_id, name) {
        await db.query(
            "UPDATE semesters SET session_id = ?, name = ? WHERE id = ?",
            [session_id, name, id]
        );
    }

    static async delete(id) {
        await db.query("DELETE FROM semesters WHERE id = ?", [id]);
    }
}

module.exports = Semester;
