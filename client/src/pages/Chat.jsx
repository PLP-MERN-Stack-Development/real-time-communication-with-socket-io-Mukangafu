import React, { useState, useEffect, useContext, useRef } from "react";
import socket from "../socket/socket";
import { AuthContext } from "../context/AuthContext";

import { IoSend, IoCamera, IoMic, IoDocument } from "react-icons/io5";
import Picker from "emoji-picker-react";

/* ------------ TIME FORMATTER ------------ */
const formatTime = (isoOrString) => {
  const date = isoOrString ? new Date(isoOrString) : new Date();
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

/* ========================================================== */
export default function Chat() {
  const { user, logout } = useContext(AuthContext);

  const [currentRoom, setCurrentRoom] = useState("general");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);

  /* ------------ AUTO SCROLL ------------ */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  /* ------------ JOIN ROOM / DM ------------ */
  useEffect(() => {
    if (!user) return;

    if (currentRoom.startsWith("dm:")) {
      const partner = currentRoom.replace("dm:", "");
      socket.emit("join_dm", { withUser: partner });
    } else {
      socket.emit("join_room", currentRoom);
    }
  }, [user, currentRoom]);

  /* ------------ SOCKET LISTENERS ------------ */
  useEffect(() => {
    socket.on("room_message", (data) => addMessage(data));
    socket.on("private_message", (data) => addMessage(data));

    socket.on("room_history", (messages) => {
      setChat(messages.map(normalizeMessage));
    });

    socket.on("dm_history", (messages) => {
      setChat(messages.map(normalizeMessage));
    });

    socket.on("online_users", setOnlineUsers);

    socket.on("user_typing", (username) =>
      setTypingUsers((prev) =>
        prev.includes(username) ? prev : [...prev, username]
      )
    );

    socket.on("stop_typing", (username) =>
      setTypingUsers((prev) => prev.filter((u) => u !== username))
    );

    return () => {
      socket.off("room_message");
      socket.off("private_message");
      socket.off("room_history");
      socket.off("dm_history");
      socket.off("online_users");
      socket.off("user_typing");
      socket.off("stop_typing");
    };
  }, []);

  /* ------------ NORMALIZATION ------------ */
  const normalizeMessage = (msg) => {
    return {
      user: msg.user || msg.sender || "Unknown",
      message: msg.message || "",
      type: msg.type || "text",
      iso: msg.iso || msg.time || new Date().toISOString(),
      fileUrl: msg.fileUrl || null,
    };
  };

  const addMessage = (msg) => {
    setChat((prev) => [...prev, normalizeMessage(msg)]);
  };

  /* ------------ SEND MESSAGE ------------ */
  const sendMessage = () => {
    if (!message.trim()) return;

    const local = {
      user: user.username,
      message,
      type: "text",
      iso: new Date().toISOString(),
    };

    addMessage(local);

    if (currentRoom.startsWith("dm:")) {
      const to = currentRoom.replace("dm:", "");
      socket.emit("private_message", { to, message });
    } else {
      socket.emit("send_room_message", { roomName: currentRoom, message });
    }

    setMessage("");
    socket.emit("stop_typing", currentRoom);
  };

  const handleTyping = () => {
    socket.emit("user_typing", currentRoom);
    setTimeout(() => socket.emit("stop_typing", currentRoom), 1500);
  };

  /* ------------ FILE UPLOAD ------------ */
  const uploadFile = async (file, type) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/api/upload/single", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    const local = {
      user: user.username,
      message: "",
      type,
      fileUrl: data.fileUrl,
      iso: new Date().toISOString(),
    };

    addMessage(local);

    if (currentRoom.startsWith("dm:")) {
      const to = currentRoom.replace("dm:", "");
      socket.emit("private_message", {
        to,
        message: "",
        type,
        fileUrl: data.fileUrl,
      });
    } else {
      socket.emit("send_room_message", {
        roomName: currentRoom,
        type,
        fileUrl: data.fileUrl,
      });
    }
  };

  const handleImage = (e) => uploadFile(e.target.files[0], "image");
  const handleFile = (e) => uploadFile(e.target.files[0], "file");

  /* ------------ VOICE RECORDING ------------ */
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    let chunks = [];

    rec.ondataavailable = (e) => chunks.push(e.data);

    rec.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const file = new File([blob], "voice.webm");
      uploadFile(file, "voice");
    };

    rec.start();
    setTimeout(() => rec.stop(), 5000);
  };

  /* ------------ MESSAGE GROUPING ------------ */
  const isSameSender = (i) => {
    if (i === 0) return false;
    return chat[i - 1].user === chat[i].user;
  };

  /* =============================================================== */
  return (
    <div className="flex h-screen bg-[#36393f] text-white font-sans">

      {/* LEFT SIDEBAR */}
      <div className="w-72 bg-[#202225] flex flex-col">
        <div className="text-xl font-bold p-4 border-b border-gray-700">
          Rooms
        </div>

        <div className="flex-1 overflow-y-auto">
          {["general", "gaming", "music", "dev", "random"].map((room) => (
            <button
              key={room}
              className={`px-4 py-3 w-full text-left hover:bg-[#5865f2] ${
                currentRoom === room ? "bg-[#5865f2]" : ""
              }`}
              onClick={() => {
                setChat([]);
                setCurrentRoom(room);
              }}
            >
              # {room}
            </button>
          ))}

          <div className="p-3 text-xs text-gray-400">Direct Messages</div>

          {onlineUsers
            .filter((u) => u !== user.username)
            .map((u) => (
              <button
                key={u}
                className={`px-4 py-2 w-full text-left hover:bg-[#5865f2] ${
                  currentRoom === `dm:${u}` ? "bg-[#5865f2]" : ""
                }`}
                onClick={() => {
                  setChat([]);
                  setCurrentRoom(`dm:${u}`);
                }}
              >
                @{u}
              </button>
            ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 bg-[#2f3136] border-b border-gray-700">
          <h2 className="text-lg font-semibold">
            {currentRoom.startsWith("dm:")
              ? `Chat with @${currentRoom.replace("dm:", "")}`
              : `#${currentRoom}`}
          </h2>
          <button
            className="bg-red-500 px-3 py-1 rounded"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {chat.map((msg, i) => (
            <div key={i} className="flex gap-3">

              {!isSameSender(i) && (
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  {msg.user?.charAt(0)?.toUpperCase()}
                </div>
              )}

              <div>
                {!isSameSender(i) && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{msg.user}</span>
                    <span className="text-xs text-gray-400">
                      {formatTime(msg.iso)}
                    </span>
                  </div>
                )}

                <div className="mt-1">
                  {msg.type === "text" && (
                    <div className="bg-[#40444b] px-3 py-2 rounded-lg">
                      {msg.message}
                    </div>
                  )}

                  {msg.type === "image" && (
                    <img
                      src={`http://localhost:5000${msg.fileUrl}`}
                      className="max-w-xs rounded-lg"
                    />
                  )}

                  {msg.type === "file" && (
                    <a
                      href={`http://localhost:5000${msg.fileUrl}`}
                      className="text-blue-300 underline"
                      target="_blank"
                    >
                      Download File
                    </a>
                  )}

                  {msg.type === "voice" && (
                    <audio controls src={`http://localhost:5000${msg.fileUrl}`} />
                  )}
                </div>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef}></div>
        </div>

        {/* TYPING */}
        {typingUsers.length > 0 && (
          <div className="px-6 py-1 text-xs italic text-gray-300">
            {typingUsers.join(", ")} typing...
          </div>
        )}

        {/* INPUT AREA */}
        <div className="px-6 py-4 bg-[#2f3136] border-t border-gray-700 flex items-center gap-3 relative">

          {/* Upload menu */}
          <div className="relative">
            <button
              onClick={() => setShowUploadMenu(!showUploadMenu)}
              className="bg-[#40444b] p-2 rounded-full hover:bg-[#5865f2]"
            >
              <IoDocument size={20} />
            </button>

            {showUploadMenu && (
              <div className="absolute bottom-12 left-0 space-y-3">

                {/* Image */}
                <label className="w-10 h-10 bg-[#5865f2] rounded-full flex items-center justify-center cursor-pointer">
                  <IoCamera size={20} />
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </label>

                {/* File */}
                <label className="w-10 h-10 bg-[#3b82f6] rounded-full flex items-center justify-center cursor-pointer">
                  <IoDocument size={20} />
                  <input type="file" onChange={handleFile} className="hidden" />
                </label>

                {/* Voice */}
                <button
                  className="w-10 h-10 bg-[#ef4444] rounded-full flex items-center justify-center"
                  onClick={startRecording}
                >
                  <IoMic size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Emoji */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="bg-[#40444b] p-2 rounded-full hover:bg-[#5865f2]"
          >
            🙂
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-20 left-10">
              <Picker onEmojiClick={(e) => setMessage(message + e.emoji)} />
            </div>
          )}

          {/* Input */}
          <input
            className="flex-1 px-4 py-2 rounded-full bg-[#40444b] outline-none"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleTyping}
          />

          {/* Send */}
          <button
            onClick={sendMessage}
            className="bg-[#5865f2] p-3 rounded-full hover:bg-[#4752c4]"
          >
            <IoSend size={20} />
          </button>

        </div>

      </div>

      {/* RIGHT SIDEBAR */}
      <div className="w-64 bg-[#2f3136] p-4 border-l border-gray-700">
        <div className="text-lg font-bold mb-3">Online Users</div>

        {onlineUsers.map((u, i) => (
          <div key={i} className="flex items-center gap-2 py-1">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            {u}
          </div>
        ))}
      </div>

    </div>
  );
}
