const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Redis clients
const pubClient = createClient();
const subClient = createClient();

(async () => {
  await pubClient.connect();
  await subClient.connect();
})();

// Subscribe to Redis
subClient.subscribe("chat", (message) => {
  io.emit("chat-message", JSON.parse(message));
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("chat-message", async (msg) => {
    await pubClient.publish(
      "chat",
      JSON.stringify({
        id: socket.id,
        message: msg,
        time: new Date().toISOString(),
      })
    );
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
