const jwt = require("jsonwebtoken");

exports.verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  jwt.verify(token, "your_secret_key", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    if (user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    req.user = user;
    next();
  });
};
