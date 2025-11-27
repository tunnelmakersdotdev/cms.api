import express from "express";
import {
  createOrUpdateUser,
  getAllUsers,
  getUserById,
} from "../controllers/userController";

const userRoutes = express.Router();

userRoutes.get("/", getAllUsers);
userRoutes.get("/get/:id", getUserById);
userRoutes.post("/add", createOrUpdateUser);
userRoutes.post("/add/:id", createOrUpdateUser);

export default userRoutes;
