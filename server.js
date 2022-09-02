import express from "express";
import morgan from "morgan";
import { Server as SocketServer } from "socket.io";
import http from "http";
import cors from "cors";
import { PORT } from "./config/index.js";

const app = express();
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(cors());
app.use(morgan("dev"));

let listUsers = [];

app.get("/listUsersConected", function (req, res) {
  res.json({
    listUsers,
  });
});

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    listUsers = listUsers.filter((item) => item.id !== socket.id);
    socket.broadcast.emit("joinUser", listUsers);
  });
  socket.on("newUser", (objUser) => {
    objUser.id = socket.id;
    listUsers.push(objUser);
    socket.broadcast.emit("joinUser", listUsers);
  });
  socket.on("sendMessage", (objMessage) => {
    objMessage.from = socket.id;
    socket.broadcast.emit(`newMessage${objMessage.to}`, objMessage);
  });
});

server.listen(PORT);
