import "dotenv/config";
import http from "http";
import app from "./express";
import connectDB from "./database";
const server = http.createServer(app);
connectDB();

server.listen(process.env.NODE_PORT, () => {
  console.log("Server running at http://localhost:" + process.env.NODE_PORT);
});
