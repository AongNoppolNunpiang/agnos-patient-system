import { createServer } from "node:http";
import { Server } from "socket.io";

const PORT = 3001;

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let patientSocketId: string | null = null;

io.on("connection", (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  socket.on("patient:join", () => {
    patientSocketId = socket.id;

    console.log(`Patient joined: ${socket.id}`);

    io.emit("patient:status", {
      status: "actively-filling",
    });
  });

  socket.on("patient:update", (patient) => {
    console.log(`Patient update received from ${socket.id}:`, patient);

    // Send the latest patient data to everyone except the sender.
    socket.broadcast.emit("patient:update", patient);
  });

  socket.on("patient:submit", (patient) => {
    console.log(`Patient submitted from ${socket.id}:`, patient);

    // Make sure Staff receives the final patient data.
    socket.broadcast.emit("patient:update", patient);

    // Update Staff status.
    socket.broadcast.emit("patient:status", {
      status: "submitted",
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(`Socket client disconnected: ${socket.id} (${reason})`);

    // Only the Patient disconnect should change Patient status.
    if (socket.id === patientSocketId) {
      patientSocketId = null;

      io.emit("patient:status", {
        status: "inactive",
      });
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server listening on http://localhost:${PORT}`);
});