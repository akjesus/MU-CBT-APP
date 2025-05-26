const db = require("../config/database");

class Session {
    static async getAll() {
        const [rows] = await db.query("SELECT * FROM sessions");
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query("SELECT * FROM sessions WHERE id = ?", [id]);
        return rows[0];
    }

    static async create(name, start_date, end_date, is_active) {
        const [result] = await db.query(
            "INSERT INTO sessions (name, start_date, end_date, is_active) VALUES (?, ?, ?, ?)",
            [name, start_date, end_date, is_active]
        );
        return result.insertId;
    }

    static async update(id, name, start_date, end_date, is_active) {
        await db.query(
            "UPDATE sessions SET name = ?, start_date = ?, end_date = ?, is_active = ? WHERE id = ?",
            [name, start_date, end_date, is_active, id]
        );
    }

    static async delete(id) {
        await db.query("DELETE FROM sessions WHERE id = ?", [id]);
    }
}

module.exports = Session;
