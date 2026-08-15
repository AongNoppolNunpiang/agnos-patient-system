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
let patientSessionId: string | null = null;

let currentPatient: Patient | null = null;
let lastPatient: Patient | null = null;

let currentStatus: "inactive" | "actively-filling" | "submitted" =
  "inactive";

let disconnectTimer: NodeJS.Timeout | null = null;

io.on("connection", (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  socket.on(
    "patient:join",
    (sessionId: string) => {
      // Cancel pending disconnect from a page refresh.
      if (disconnectTimer) {
        clearTimeout(disconnectTimer);
        disconnectTimer = null;
      }

      const isSamePatientSession =
        patientSessionId !== null &&
        patientSessionId === sessionId &&
        currentPatient !== null;

      patientSocketId = socket.id;
      patientSessionId = sessionId;

      console.log(`Patient joined: ${socket.id}`);
      console.log(`Patient session: ${sessionId}`);

      if (isSamePatientSession) {
        console.log("Restoring existing patient session:", currentPatient);

        socket.emit("patient:restore", {
          patient: currentPatient,
          status: currentStatus,
        });

        io.emit("patient:status", {
          status: currentStatus,
        });

        return;
      }

      // New patient session.
      currentPatient = null;
      currentStatus = "actively-filling";

      socket.emit("patient:restore", {
        patient: null,
        status: currentStatus,
      });

      io.emit("patient:status", {
        status: currentStatus,
      });
    },
  );

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
      console.log("Sending current patient to staff:", currentPatient);

      socket.emit("patient:update", currentPatient);
    }

    socket.emit("patient:status", {
      status: patientSocketId ? currentStatus : "inactive",
    });

    console.log("Sending last patient to staff:", lastPatient);

    socket.emit("patient:last", lastPatient);
  });

  socket.on("disconnect", (reason) => {
    console.log(
      `Socket client disconnected: ${socket.id} (${reason})`,
    );

    if (socket.id !== patientSocketId) {
      return;
    }

    /*
     * Do not immediately clear the patient.
     *
     * A browser refresh causes:
     * old socket disconnect
     * ↓
     * new socket connect
     *
     * Give the same Patient session a short window to reconnect.
     */
    disconnectTimer = setTimeout(() => {
      console.log("Patient session ended.");

      if (currentPatient) {
        lastPatient = currentPatient;

        console.log("Saved last patient:", lastPatient);
      }

      patientSocketId = null;
      patientSessionId = null;
      currentPatient = null;
      currentStatus = "inactive";

      io.emit("patient:status", {
        status: currentStatus,
      });

      io.emit("patient:current", null);
      io.emit("patient:last", lastPatient);

      disconnectTimer = null;
    }, 3000);
  });
});

httpServer.listen(PORT, () => {
  console.log(
    `Socket.IO server listening on http://localhost:${PORT}`,
  );
});