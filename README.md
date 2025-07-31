#  PingMe – MERN Stack Real-Time Chat Application
PingMe is a real-time chat application built using the MERN Stack (MongoDB, Express, React, Node.js) and Socket.io. It allows users to send and receive messages instantly with a clean UI and responsive design.

# Features
🔥 Real-time messaging with Socket.io  
🛡️ JWT-based authentication  
🗂️ Cloudinary integration for image uploads  
📱 Responsive UI with React + Vite  
🚪 Secure login & signup using bcrypt  
🌐 Cross-Origin support using CORS  

# Tech Stack
# Frontend (Client):  
React (with Vite)  
React Router DOM  
Tailwind CSS (if used)  
# Backend (Server):  
Node.js + Express  
MongoDB (Mongoose for ORM)  
Socket.io for real-time communication  
JWT for authentication  
Cloudinary for media storage  

# 📂 Folder Structure
```PingMe/
├── client/           # Frontend (React + Vite)
│   └── src/         
│       └── components/
│       └── pages/
│       └── App.jsx
│       └── main.jsx
│
├── server/           # Backend (Node.js + Express)
│   └── controllers/
│   └── models/
│   └── routes/
│   └── server.js
│
└── README.md         # Project documentation
```

# Installation & Setup
1️⃣ Clone the Repository  
git clone https://github.com/Shreyyaa17/ping-me.git  
cd ping-me 

2️⃣ Setup Server  
cd server  
npm install  

Required Environment Variables (.env)  
MONGO_URI=your_mongodb_connection_string  
JWT_SECRET=your_secret_key  
CLOUDINARY_CLOUD_NAME=your_cloudinary_name  
CLOUDINARY_API_KEY=your_cloudinary_api_key  
CLOUDINARY_API_SECRET=your_cloudinary_api_secret 

Start the Backend:  
npm run dev   # using nodemon  

3️⃣ Setup Client  
cd client  
npm install  
If using Vite, start the client with:  
npm run dev  

▶️ Running the App  
Start the server → runs on http://localhost:5000 (or configured port)  
Start the client → runs on http://localhost:5173 (Vite default)  

# Socket.io Integration  
Real-time messaging is handled using Socket.io.  
Each client connects to the socket server and listens for incoming messages in real-time.

# Future Enhancements
✅ Group chats  
✅ Message reactions  
✅ Online/offline status  
✅ Push notifications  

🌟 If you like this project, give it a ⭐ on GitHub!
