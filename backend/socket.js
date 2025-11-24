// socket.js
let io = null;

function initSocket(server) {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: "https://splitzy-blond.vercel.app",
      methods: ["GET", "POST"],
      credentials: true,
    }
  });
  
  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId;

    console.log("🔥 User connected:", userId);

    if (userId) {
      socket.join(userId);
    }

    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", userId);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

module.exports = { initSocket, getIO };
