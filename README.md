# PingMe – MERN Stack Real-Time Chat Application

**PingMe** is a real-time chat application built using the **MERN Stack** (MongoDB, Express.js, React, Node.js) and **Socket.io**. It enables users to send and receive messages instantly with a clean UI and responsive design.

## 🚀 Features

- 🔥 Real-time messaging with **Socket.io**
- 🛡️ **JWT-based authentication**
- 🗂️ **Cloudinary** integration for image uploads
- 📱 Responsive UI with **React + Vite**
- 🚪 Secure **login & signup** using bcrypt
- 🌐 **CORS** enabled for cross-origin support

## 🛠️ Tech Stack

### → Frontend

- React (Vite)
- React Router DOM
- Tailwind CSS (if used)

### → Backend

- Node.js + Express
- MongoDB + Mongoose (ORM)
- Socket.io
- JWT
- Cloudinary

## 📁 Folder Structure

```ping-me/
├── client/ # Frontend (React + Vite)
│ └── src/
│ └── components/
│ └── pages/
│ └── App.jsx
│ └── main.jsx
│
├── server/ # Backend (Node.js + Express)
│ └── controllers/
│ └── models/
│ └── routes/
│ └── server.js
│
└── README.md # Project documentation
```

## ⚙️ Installation & Setup

1️⃣ Clone the Repository

git clone https://github.com/Shreyyaa17/ping-me.git  
cd ping-me

2️⃣ Setup Server

cd server  
npm install

Reuiredn Environment Variables:  
MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_secret_key  
CLOUDINARY_CLOUD_NAME=your_cloudinary_name  
CLOUDINARY_API_KEY=your_cloudinary_api_key  
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

Start the server:  
npm run dev # using nodemon

3️⃣ Setup Client

cd client  
npm install  
npm run dev

▶️ Running the App

Backend → http://localhost:5000  
Frontend → http://localhost:5173

## 💬 Socket.io Integration

Real-time messaging powered by Socket.io  
Each client connects to the socket server and listens for incoming messages in real-time

## 🌱 Future Enhancements

✅ Group chats  
✅ Message reactions  
✅ Online/offline status  
✅ Push notifications

🌟 Like the project?
Give it a ⭐ on GitHub and share your feedback!
