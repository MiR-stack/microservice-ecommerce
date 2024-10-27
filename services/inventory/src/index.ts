import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import {
  createInventory,
  getInventory,
  getInventoryDetails,
  updateInventory,
} from "./controllers";

dotenv.config();

const app = express();

app.use(express.json(), morgan("dev"), cors());

// helth check
app.use("/helth", (_req, res) => {
  res.status(200).json({ msg: "ok" });
});

// routes
app.post("/inventories", createInventory);
app.put("/inventories/:id", updateInventory);
app.get("/inventories/:id/details", getInventoryDetails);
app.get("/inventories/:id", getInventory);

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
const port = process.env.PORT || 4002;
const service = process.env.SERVICE || "Inventory-Service";

app.listen(port, () => {
  console.log(`${service} Running on http://localhost:${port}`);
});
