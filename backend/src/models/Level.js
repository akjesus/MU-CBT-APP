const db = require("../config/database");

class Level {
    static async getAll() {
        const [rows] = await db.query("SELECT * FROM levels");
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.query("SELECT * FROM levels WHERE id = ?", [id]);
        return rows[0];
    }

    static async create(name) {
        const [result] = await db.query(
            "INSERT INTO levels (name) VALUES (?)",
            [name]
        );
        return result.insertId;
    }

    static async update(id, name) {
        await db.query(
            "UPDATE levels SET name = ? WHERE id = ?",
            [name, id]
        );
    }

    static async delete(id) {
        await db.query("DELETE FROM levels WHERE id = ?", [id]);
    }
}

module.exports = Level;
