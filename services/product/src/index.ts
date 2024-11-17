import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "./controllers";
import getProductDetails from "./controllers/getProductDetails";
import updateProducts from "./controllers/updateProducts";

dotenv.config();

const app = express();

app.use(express.json(), morgan("dev"), cors());

// helth check
app.use("/helth", (_req, res) => {
  res.status(200).json({ msg: "ok" });
});

// routes
app.post("/products", createProduct);
app.put("/products/bulk/update", updateProducts);
app.put("/products/:id", updateProduct);
app.get("/products/:id/details", getProductDetails);
app.get("/products/:id", getProduct);
app.get("/products", getProducts);

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
const port = process.env.PORT || 4001;
const service = process.env.SERVICE || "Product-Service";

app.listen(port, () => {
  console.log(`${service} Running on http://localhost:${port}`);
});
