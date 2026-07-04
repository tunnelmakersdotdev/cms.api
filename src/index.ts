import "dotenv/config";
import http from "http";
import app from "./express";
import connectDB from "./database";
import { initSocket } from "./socket";

const server = http.createServer(app);
connectDB();
initSocket(server);

server.listen(process.env.NODE_PORT, () => {
  console.log("Server running at http://localhost:" + process.env.NODE_PORT);
});
