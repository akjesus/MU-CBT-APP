const server = require("./src/app");
const PORT = process.env.PORT;
const SERVER = process.env.BACKEND_SERVER_IP;

server.listen(PORT, SERVER, () => {
  console.log(`Server is running on port ${PORT} at ${SERVER}`);
});
