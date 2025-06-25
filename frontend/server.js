const express = require("express");
const path = require("path");
const app = express();
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

// const webSocket = require('./webSocket')
// Use PORT 3003 for the frontend
const PORT = process.env.FRONTEND_PORT;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));

// Catch-all route: serve index.html or some fallback

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});


app.listen(PORT, () => {
  console.log(
    `Frontend Server is running at http://${process.env.FRONTEND_SERVER_IP}:${PORT}`
  );
});
