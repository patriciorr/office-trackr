import dotenv from "dotenv";
import { logger } from "./config/logger";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { createServer } from "http";
import { initSocket } from "./sockets";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import eventRoutes from "./routes/eventRoutes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);

// Global error handler (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = createServer(app);
initSocket(server);

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  })
  .catch((err) => logger.error("DB connection error:", err));
