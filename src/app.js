import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import schoolRoutes from "./routes/schoolRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import apiLimiter from "./middlewares/rateLimiter.js";
import AppError from "./utils/AppError.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDirectory = path.join(__dirname, "..", "frontend");
const frontendIndexFile = path.join(frontendDirectory, "index.html");

app.use(helmet()); // for security http headers
app.use(cors()); // for cross origin requests
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} // for logging
app.use(
  express.json({
    limit: "20kb",
  }),
); // for parsing json
app.use(express.static(frontendDirectory));
app.use((req, res, next) => {
  const acceptHeader = req.headers.accept || "";
  const isBrowserPageRequest =
    req.method === "GET" && acceptHeader.includes("text/html");

  if (isBrowserPageRequest) {
    return res.sendFile(frontendIndexFile);
  }

  next();
});

app.use(apiLimiter);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

app.get("/", (req, res) => {
  const acceptHeader = req.headers.accept || "";
  const wantsHtml = acceptHeader.includes("text/html");

  if (wantsHtml) {
    return res.sendFile(frontendIndexFile);
  }

  res.status(200).json({
    success: true,
    message: "Welcome to school management api",
  });
});

app.use("/", schoolRoutes);
app.use("/api/v1/schools", schoolRoutes);

// 404 handler
app.all("/{*splat}", (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorMiddleware);

export default app;
