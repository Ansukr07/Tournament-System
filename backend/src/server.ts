import express, { type Express } from "express"
import cors from "cors"
import http from "http"
import { Server } from "socket.io"
import connectDB from "./config/db"
import { setupSocket } from "./socket"
import authRoutes from "./routes/auth"
import playerRoutes from "./routes/players"
import eventRoutes from "./routes/events"
import matchRoutes from "./routes/matches"
import teamRoutes from "./routes/teams"
import dotenv from "dotenv";
dotenv.config();

const app: Express = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: "*" } })

// ========================================================================
// 🔥 FIXED CORS CONFIG (Required for frontend to send Authorization token)
// ========================================================================
const allowedOrigins = [
  "http://localhost:3000",
  "https://tournament-system-kohl.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

// Handle preflight CORS
app.options("*", cors())

// ========================================================================
// JSON Middleware
// ========================================================================
app.use(express.json())

// ========================================================================
// Debug Logger – (shows request + headers)
// ========================================================================
app.use((req, res, next) => {
  console.log("==== NEW REQUEST ====")
  console.log(req.method, req.url)
  console.log("Headers:", req.headers)
  next()
})

// ========================================================================
// Database
// ========================================================================
connectDB()

// ========================================================================
// Socket.io Setup
// ========================================================================
setupSocket(io)

// ========================================================================
// API Routes
// ========================================================================
app.use("/api/auth", authRoutes)
app.use("/api/players", playerRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/matches", matchRoutes)
app.use("/api/teams", teamRoutes)

// ========================================================================
// Start Server
// ========================================================================
const PORT = process.env.PORT || 5000

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
}

export { io }
