import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import configRoutes from "./utils";

dotenv.config();

const app = express();

app.use(express.json(), morgan("dev"), cors(), helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  handler: (_req, res: Response) => {
    res.status(429).json({ msg: "too manay request. please try again later" });
  },
});

// Apply the rate limiting middleware to all requests.
app.use("api", limiter);

// helth check
app.use("/helth", (_req, res) => {
  res.status(200).json({ msg: "ok" });
});

// routes
configRoutes(app);

// 404 error handle
app.use("*", (_req, res: Response) => {
  res.status(404).json({ msg: "data not found" });
});

// global error handle
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error.stack);

  res.status(500).json({ msg: "internal server error" });
});

// runnig server
const port = process.env.PORT || 8081;
const service = process.env.SERVICE || "api-gatway";

app.listen(port, () => {
  console.log(`${service} Running on http://localhost:${port}`);
});
