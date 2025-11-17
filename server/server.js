/* ============================================
   CLEAN WORKING CHAT SERVER (PUBLIC + DM)
   ============================================ */

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import authRoutes from "./routes/authRoutes.js";
import Message from "./models/Message.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ---------------------------------------------
// DATABASE
// ---------------------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((e) => console.log("❌ Mongo Error:", e));

app.use("/api/auth", authRoutes);

// ---------------------------------------------
// SOCKET.IO SERVER
// ---------------------------------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

// ---------------------------------------------
// SOCKET AUTH (VERY IMPORTANT)
// ---------------------------------------------
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Token missing"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // MUST CONTAIN username
    socket.user = {
      id: decoded.id,
      username: decoded.username,
    };

    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

let onlineUsers = [];

// =============================================
//               SOCKET HANDLER
// =============================================
io.on("connection", (socket) => {
  const username = socket.user.username;

  console.log(`🟢 ${username} connected`);

  // Track user online
  if (!onlineUsers.includes(username)) {
    onlineUsers.push(username);
  }
  io.emit("online_users", onlineUsers);

  // -------------------------------------------
  // JOIN ROOM (PUBLIC)
  // -------------------------------------------
  socket.on("join_room", async (roomName) => {
    socket.join(roomName);

    // Load history from Mongo
    const history = await Message.find({ room: roomName }).sort({ createdAt: 1 });

    socket.emit(
      "room_history",
      history.map((m) => ({
        user: m.sender,
        message: m.message,
        type: m.type,
        fileUrl: m.fileUrl,
        iso: m.createdAt,
      }))
    );

    // Announce join
    socket.to(roomName).emit("room_message", {
      user: "System",
      type: "system",
      message: `${username} joined the room`,
      iso: new Date(),
    });
  });

  // -------------------------------------------
  // SEND PUBLIC MESSAGE
  // -------------------------------------------
  socket.on("send_room_message", async ({ roomName, message, type = "text", fileUrl = null }) => {
    const payload = {
      user: username,
      message,
      type,
      fileUrl,
      iso: new Date(),
    };

    // Send to everyone (including sender)
    io.to(roomName).emit("room_message", payload);

    // Save
    await Message.create({
      sender: username,
      receiver: null,
      room: roomName,
      message,
      type,
      fileUrl,
    });
  });

  // -------------------------------------------
  // DIRECT MESSAGES (DM)
  // -------------------------------------------
  const dmRoom = (u1, u2) => {
    return `dm:${[u1, u2].sort().join("_")}`;
  };

  // Join DM room
  socket.on("join_dm", async ({ withUser }) => {
    const room = dmRoom(username, withUser);

    socket.join(room);

    const history = await Message.find({
      $or: [
        { sender: username, receiver: withUser },
        { sender: withUser, receiver: username },
      ],
    }).sort({ createdAt: 1 });

    socket.emit(
      "dm_history",
      history.map((m) => ({
        user: m.sender,
        message: m.message,
        type: m.type,
        fileUrl: m.fileUrl,
        iso: m.createdAt,
      }))
    );
  });

  // Send private message
  socket.on("private_message", async ({ to, message, type = "text", fileUrl = null }) => {
    const room = dmRoom(username, to);

    const payload = {
      user: username,
      message,
      type,
      fileUrl,
      iso: new Date(),
    };

    io.to(room).emit("private_message", payload);

    await Message.create({
      sender: username,
      receiver: to,
      room: null,
      message,
      type,
      fileUrl,
    });
  });

  // -------------------------------------------
  // TYPING INDICATORS
  // -------------------------------------------
  socket.on("user_typing", (room) => {
    socket.to(room).emit("user_typing", username);
  });

  socket.on("stop_typing", (room) => {
    socket.to(room).emit("stop_typing", username);
  });

  // -------------------------------------------
  // DISCONNECT
  // -------------------------------------------
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((u) => u !== username);
    io.emit("online_users", onlineUsers);
    console.log(`🔴 ${username} disconnected`);
  });
});

// =============================================
// START SERVER
// =============================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
