import { createServer } from "node:http";
import { Server } from "socket.io";
import type { Patient } from "../types/patient";

const PORT = 3001;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let patientSocketId: string | null = null;
let currentPatient: Patient | null = null;
let currentStatus: "inactive" | "actively-filling" | "submitted" =
  "inactive";

io.on("connection", (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  socket.on("patient:join", () => {
    patientSocketId = socket.id;
    currentStatus = "actively-filling";

    console.log(`Patient joined: ${socket.id}`);

    io.emit("patient:status", {
      status: currentStatus,
    });
  });

  socket.on("patient:update", (patient: Patient) => {
    if (socket.id !== patientSocketId) {
      return;
    }

    currentPatient = patient;

    console.log(`Patient update received from ${socket.id}:`, patient);

    socket.broadcast.emit("patient:update", patient);
  });

  socket.on("patient:submit", (patient: Patient) => {
    if (socket.id !== patientSocketId) {
      return;
    }

    currentPatient = patient;
    currentStatus = "submitted";

    console.log(`Patient submitted from ${socket.id}:`, patient);

    socket.broadcast.emit("patient:update", patient);

    socket.broadcast.emit("patient:status", {
      status: currentStatus,
    });
  });

  socket.on("staff:join", () => {
    console.log(`Staff joined: ${socket.id}`);

    if (currentPatient) {
      socket.emit("patient:update", currentPatient);
    }

    socket.emit("patient:status", {
      status: patientSocketId ? currentStatus : "inactive",
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(
      `Socket client disconnected: ${socket.id} (${reason})`,
    );

    if (socket.id === patientSocketId) {
      patientSocketId = null;
      currentStatus = "inactive";

      io.emit("patient:status", {
        status: currentStatus,
      });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(
    `Socket.IO server listening on http://localhost:${PORT}`,
  );
});