const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const path = require("path");

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send(`<h1>Hello from Node server on port ${PORT}</h1>`);
  console.log(`HTTP request handled by server on port ${PORT}`);
});

// === Redis adapter ===
// Use explicit Redis URL for localhost
const pubClient = createClient({ url: "redis://127.0.0.1:6379" });
const subClient = createClient({ url: "redis://127.0.0.1:6379" });

// Handle Redis errors
pubClient.on("error", (err) => console.log(`[${PORT}] Redis Pub Error:`, err));
subClient.on("error", (err) => console.log(`[${PORT}] Redis Sub Error:`, err));

(async () => {
  await pubClient.connect();
  await subClient.connect();

  io.adapter(createAdapter(pubClient, subClient));
  console.log(`[${PORT}] Redis adapter connected`);
})();

// === Socket.IO events ===
io.on("connection", (socket) => {
  console.log(`[${PORT}] Client connected:`, socket.id);

  // Button click
  socket.on("button-click", () => {
    console.log(`[${PORT}] Button clicked by ${socket.id}`);
    io.emit("button-event", {
      from: socket.id,
      port: PORT,
      time: new Date().toISOString(),
    });
  });

  // Chat message
  socket.on("chat-message", (msg) => {
    console.log(`[${PORT}] Message from ${socket.id}: ${msg}`);
    io.emit("chat-message", {
      from: socket.id,
      port: PORT,
      message: msg,
      time: new Date().toISOString(),
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
