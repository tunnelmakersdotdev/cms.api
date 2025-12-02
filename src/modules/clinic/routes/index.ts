import express from "express";
import {
  createOrUpdateClinic,
  getAllClinics,
  getClinicById,
} from "../controllers/clinicController";
// import {
//   createOrUpdateUser,
//   getAllUsers,
//   getUserById,
// } from "../controllers/userController";

const clinicRoutes = express.Router();

clinicRoutes.get("/", getAllClinics);
clinicRoutes.post(["/add/", "/add/:id"], createOrUpdateClinic);
clinicRoutes.get("/get/:id", getClinicById);

// userRoutes.post("/add", createOrUpdateUser);

export default clinicRoutes;
