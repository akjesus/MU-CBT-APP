const db = require("../config/database");

class Faculty {
    static async getAll() {
        const [rows] = await db.query("SELECT * FROM faculties");
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query("SELECT * FROM faculties WHERE id = ?", [id]);
        return rows[0];
    }

    static async create(name) {
        const [result] = await db.query(
            "INSERT INTO faculties (name) VALUES (?)",
            [name]
        );
        return result.insertId;
    }

    static async update(id, name) {
        await db.query(
            "UPDATE faculties SET name = ? WHERE id = ?",
            [name, id]
        );
    }

    static async delete(id) {
        await db.query("DELETE FROM faculties WHERE id = ?", [id]);
    }
}

module.exports = Faculty;
