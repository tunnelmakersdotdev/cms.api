import { Server } from "socket.io";
import http from "http";

let io: Server | null = null;

/** Attach a Socket.IO server to the HTTP server. Call once at startup. */
export const initSocket = (server: http.Server): Server => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    // Clients may join a clinic room to scope updates to their clinic.
    socket.on("clinic:subscribe", (clinicId: string) => {
      if (clinicId) socket.join(`clinic:${clinicId}`);
    });
  });

  return io;
};

/**
 * Notify clients that clinic data changed. Emits globally (system-admin views)
 * and to the specific clinic room (clinic-admin views) when an id is given.
 */
export const emitClinicChanged = (payload: {
  id?: string;
  action?: "created" | "updated" | "approved" | "rejected";
}) => {
  if (!io) return;
  io.emit("clinic:changed", payload);
  if (payload.id) io.to(`clinic:${payload.id}`).emit("clinic:changed", payload);
};

/** Notify the token-display board for a clinic that its queue changed. */
export const emitDisplayChanged = (clinicId?: string) => {
  if (!io || !clinicId) return;
  io.emit("display:changed", { clinicId });
};

export const getIo = (): Server | null => io;
