import express from "express";
import {
  bookAppointment,
  cancelAppointment,
  getAvailableSlots,
} from "../controllers/appointmentController";

// Public/customer booking routes — mounted at /booking (not behind /admin).
// NOTE: once customer auth exists, guard book/cancel and derive customerId
// from req.user instead of the request body.
const bookingRoutes = express.Router();

bookingRoutes.get("/slots/:doctorId", getAvailableSlots);
bookingRoutes.post("/book", bookAppointment);
bookingRoutes.post("/cancel/:id", cancelAppointment);

export default bookingRoutes;
