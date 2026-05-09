import fs from "fs";

const HISTORY_FILE = "./messages.json";
let messageHistory = [];

// load history if exists
if (fs.existsSync(HISTORY_FILE)) {
  const data = fs.readFileSync(HISTORY_FILE);
  messageHistory = JSON.parse(data);
}

setInterval(() => {
  io.emit("heartbeat");
}, 30000);

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.emit("chat history", messageHistory);
  socket.on("chat message", (data) => {
    messageHistory.push(data);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(messageHistory, null, 2));
    io.emit("chat message", data);
  });
  socket.on("requestHistory", () => {
    socket.emit("chat history", messageHistory);
  });
  socket.on("messageRead", (messageId) => {
    io.emit("messageReadUpdate", messageId);
  });
});

httpServer.listen(3000, () => {
  console.log("Active server on port 3000");
});

