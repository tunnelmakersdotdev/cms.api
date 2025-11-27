import express from "express";
import allRoutes from "../routes";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/", allRoutes);

export default app;
