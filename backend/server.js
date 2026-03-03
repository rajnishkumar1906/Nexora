import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// Global configs
import connectDb from "./config/db.js";
import cloudConfig from "./config/cloud_config.js";

// Import all services
import authService from "./authentication/index.js";
import profileService from "./user-profile/index.js";
import friendsService from "./friends/index.js";
import serversService from "./servers/index.js";
import channelsService from "./channels/index.js";
import dmChatService from "./dm-chat/index.js";
import gamesService from "./games/index.js";
import notificationsService from "./notifications/index.js";
import realtimeService from "./real-time/index.js";

dotenv.config();

/* ================= INIT CONFIG ================= */
cloudConfig();
connectDb();

const app = express();

/* ✅ REQUIRED FOR DEPLOY */
app.set("trust proxy", 1);

/* ================= CORS CONFIG ================= */
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log("Blocked origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

/* ================= GLOBAL MIDDLEWARE ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* ✅ TEMP FILES IN DEV ONLY */
if (process.env.NODE_ENV !== "production") {
  app.use("/temp", express.static("temp"));
}

/* ================= REGISTER ALL SERVICE ROUTES ================= */
app.use("/api/auth", authService.router);
app.use("/api/users", profileService.router);
app.use("/api/friends", friendsService.router);
app.use("/api/servers", serversService.router);
app.use("/api/channels", channelsService.router);
app.use("/api/chat", dmChatService.router);
app.use("/api/games", gamesService.router);
app.use("/api/notifications", notificationsService.router);

/* ================= HEALTH CHECK ================= */
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    message: "Nexora API running",
    timestamp: new Date().toISOString(),
    services: [
      "auth", "profile", "friends", "servers", 
      "channels", "dm-chat", "games", "notifications", "realtime"
    ]
  });
});

/* ================= 404 HANDLER ================= */
app.use((req, res) => {
  res.status(404).json({ 
    message: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

/* ================= ERROR HANDLING ================= */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {}
  });
});

/* ================= SOCKET.IO ================= */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  pingTimeout: 60000,
});

// Initialize real-time service with io
realtimeService.initialize(io);

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Nexora server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📦 Services loaded: 9/9`);
});

export default app;