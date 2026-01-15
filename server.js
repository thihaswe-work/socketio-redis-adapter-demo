// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// const { createClient } = require("redis");
// const path = require("path");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// // Serve static files
// app.use(express.static(path.join(__dirname, "public")));

// // Redis clients
// const pubClient = createClient();
// const subClient = createClient();

// (async () => {
//   await pubClient.connect();
//   await subClient.connect();
// })();

// // Subscribe to Redis
// subClient.subscribe("chat", (message) => {
//   io.emit("chat-message", JSON.parse(message));
// });

// io.on("connection", (socket) => {
//   console.log("Client connected:", socket.id);

//   socket.on("chat-message", async (msg) => {
//     await pubClient.publish(
//       "chat",
//       JSON.stringify({
//         id: socket.id,
//         message: msg,
//         time: new Date().toISOString(),
//       })
//     );
//   });
// });

// server.listen(3000, () => {
//   console.log("Server running on http://localhost:3000");
// });
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

app.use(express.static(path.join(__dirname, "public")));

// Redis pub/sub clients
const pubClient = createClient();
const subClient = pubClient.duplicate();

(async () => {
  await pubClient.connect();
  await subClient.connect();

  // Attach Redis adapter to Socket.IO
  io.adapter(createAdapter(pubClient, subClient));

  console.log("Redis adapter connected");
})();

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log(`[${PORT}] Client connected:`, socket.id);

  socket.on("button-click", async () => {
    io.emit("button-event", {
      from: socket.id,
      port: PORT,
      time: new Date().toISOString(),
    });
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
