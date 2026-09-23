import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB, isDBConnected } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const clientRoot = path.resolve(projectRoot, 'client');
const distRoot = path.resolve(projectRoot, 'dist');

// creating express app and http server
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// socket.io setup
export const io = new Server(server, {
  cors: { origin: '*' },
});

// store online users
export const userSocketMap = {}; // {userId: socketId}

const getOnlineUserIds = () => {
  const online = new Set(Object.keys(userSocketMap));
  if (!isDBConnected()) {
    // Show Alison, Martin, Marco as online in mock mode
    online.add("680f50aaf10f3cd28382ecf2");
    online.add("680f50e4f10f3cd28382ecf9");
    online.add("680f5137f10f3cd28382ed10");
  }
  return Array.from(online);
};

// socket.io connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // emit online users to all connected clients
  io.emit("getOnlineUsers", getOnlineUserIds());

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", getOnlineUserIds());
  });
});

// middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: '*',
  credentials: true,
  allowedHeaders: ['Content-Type', 'token', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// API routes
app.use("/api/status", (req, res) => res.json({ status: "ok", app: "PingMe" }));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Error middleware for database fallback if MongoDB throws
app.use((err, req, res, next) => {
  if (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || (err.message && err.message.includes('buffering timed out'))) {
    console.warn('[PingMe] Database offline fallback triggered:', err.message);
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Database service offline' });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message });
});

// Connect to DB (or start in-memory)
await connectDB();

// Serve frontend: dev middleware or production static build
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction && process.env.NODE_ENV !== "test") {
  try {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
      root: clientRoot,
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const indexHtmlPath = path.resolve(clientRoot, 'index.html');
        let template = fs.readFileSync(indexHtmlPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } catch (viteError) {
    console.warn("[PingMe] Vite middleware mode error, falling back to static:", viteError.message);
  }
} else if (fs.existsSync(distRoot)) {
  app.use(express.static(distRoot));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distRoot, 'index.html'));
  });
}

// Start server on port 3000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`PingMe server is running on http://0.0.0.0:${PORT}`);
});

export default server;
