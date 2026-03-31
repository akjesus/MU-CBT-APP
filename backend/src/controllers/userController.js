
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/database");


exports.login = async (req, res) => {
    try {
      const { username, password } = req.body; 
        if (!username || !password) {
            return res.status(400).json({ error: "User and password are required" });
        }

        const [rows] = await db.query(`SELECT * FROM staff WHERE email = ? or username = ?`, 
            [username, username]);
        let user = rows[0];
        if (!user) {
           const [rows] = await db.query(`SELECT * FROM students WHERE email = ? 
            or username = ? or registration_number = ?`, [username, username, username]);
           const user = rows[0];
           if (!user) {
               return res.status(401).json({ error: "Invalid Username" });
           }
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

