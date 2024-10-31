import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import {
  sendVerificationEmail,
  userLogin,
  userRegistration,
  verifyEmail,
  verifyToken,
} from "./controllers";

dotenv.config();

const app = express();

app.use(express.json(), morgan("dev"), cors());

// helth check
app.use("/helth", (_req, res) => {
  res.status(200).json({ msg: "ok" });
});

// routes
app.post("/auth/register", userRegistration, sendVerificationEmail);
app.post("/auth/login", userLogin);
app.post("/auth/verify-token", verifyToken);
app.post("/auth/verify-email", verifyEmail);
app.post("/auth/verify-email/send", sendVerificationEmail);

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
const port = process.env.PORT || 4003;
const service = process.env.SERVICE || "Auth-Service";

app.listen(port, () => {
  console.log(`${service} Running on http://localhost:${port}`);
});
