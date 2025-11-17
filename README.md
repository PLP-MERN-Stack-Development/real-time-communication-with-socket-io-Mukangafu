Real-Time Chat Application (Socket.IO + MERN)

A full real-time chat application built using Socket.IO, React (Vite), Node.js, Express, and MongoDB.
Supports public chat rooms, private DMs, online presence, typing indicators, file sharing, emojis, and more.

Live Demo (Frontend):
🔗 https://socketio-czh6.vercel.app/

Backend API (Render):
🔗 https://real-time-communication-with-socket-io-nypj.onrender.com/

📌 Project Overview

This is a modern real-time communication app similar to Discord / WhatsApp Web, built with:

React + Vite frontend

Node.js + Express backend

Socket.IO for bi-directional messaging

MongoDB Atlas for message + user storage

JWT Authentication

File uploads (images, documents, voice notes)

It supports public chat rooms, private direct messaging (DM), typing indicators, active users list, and chat history persistence.

🛠️ Tech Stack
Frontend

React + Vite

Socket.IO client

Axios

TailwindCSS

Emoji Picker (emoji-picker-react)

React Icons

Backend

Node.js / Express

Socket.IO server

MongoDB + Mongoose

JWT Authentication

CORS enabled

Multer (optional for uploads)

Deployment

Frontend → Vercel

Backend → Render

Database → MongoDB Atlas

⭐ Features Implemented
✔ User Authentication

Register & Login with JWT

Secure token handling via HTTP-only headers

Auto-login after registration

✔ Public Chat Rooms

Join multiple channels (general, gaming, music, etc.)

Real-time messages broadcast to all users in the room

Message timestamps & grouping

✔ Private Messaging (DMs)

Click any online user to start a private channel

Chat stored under unique ID: dm:userA_userB

Fully real-time

✔ Typing Indicators

Shows “username is typing…” live

Works for rooms and DMs

✔ Online Users List

Live updates when users join/leave

Displays in sidebar

✔ Chat History Saved in MongoDB

Reloading keeps messages

Each channel & DM has separate history

✔ File Sharing

Upload:

Images

Documents

Audio messages (voice notes)

Auto-preview in chat

✔ Emoji Picker

WhatsApp-style emoji selector

Adds emoji to text input

✔ Floating Upload Menu

Camera (Image upload)

Document upload

Microphone recording (voice message)

✔ Message Grouping (Discord-style)

Avatars hidden for consecutive messages from same user

📦 Folder Structure
root/
├── client/        # React frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── socket/
│   │   └── components/
│   └── vite.config.js
├── server/        # Express + Socket.IO backend
│   ├── routes/
│   ├── models/
│   ├── server.js
│   └── .env
└── README.md

⚙️ Setup Instructions (LOCAL DEVELOPMENT)
1️⃣ Clone The Repository
git clone https://github.com/PLP-MERN-Stack-Development/real-time-communication-with-socket-io-Mukangafu
cd real-time-communication-with-socket-io-Mukangafu

2️⃣ Install Backend Dependencies
cd server
npm install

3️⃣ Create .env file inside server/
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

4️⃣ Start Backend
npm start

5️⃣ Install Frontend Dependencies
cd ../client
npm install

6️⃣ Create .env inside client/
VITE_API_URL=https://your-backend-url.onrender.com

7️⃣ Start Frontend
npm run dev


Open:
👉 http://localhost:5173/

🚀 Deployment Instructions
▶ Deployment (Backend on Render)

Create new Web Service

Select your GitHub repository

Set:

Build Command: npm install
Start Command: node server.js


Add Environment Variables:

MONGO_URI=...
JWT_SECRET=...


Deploy!

▶ Deployment (Frontend on Vercel)

Go to https://vercel.com

Import GitHub repo

Select client folder as root directory

Add environment variable:

VITE_API_URL=https://your-render-backend-url


Build & Deploy

🔌 API & Socket Events
REST Endpoints
Method	Endpoint	Description
POST	/api/auth/register	Create account
POST	/api/auth/login	Login user
🎧 Socket.IO Events
Emit (Client → Server)

join_room

send_room_message

join_dm

private_message

user_typing

stop_typing

Listen (Server → Client)

room_message

private_message

room_history

dm_history

online_users

user_typing

stop_typing
License

MIT License

Dan Muturi 2025
