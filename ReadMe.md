# Socket.IO + Redis App

A real-time Node.js application using **Socket.IO** with a **Redis adapter** to enable horizontal scaling across multiple server instances. Events are broadcast to all connected clients via Redis pub/sub.

## Architecture

```
        Users
          ↓
  ┌───────────────┐
  │  Load Balancer │
  │ (round-robin)  │
  └───────┬───────┘
          ↓
  ┌───────┴───────┐
  │   Node.js     │
  │   Server #1   │
  └───────┬───────┘
          ↓
  ┌───────┴───────┐
  │     Redis     │
  │  (pub/sub)    │
  └───────────────┘
```

Each server instance connects to the same Redis instance. When one server emits an event, Redis publishes it so all other servers receive and forward it to their connected clients.

## Tech Stack

- **Node.js** + **Express** — HTTP server
- **Socket.IO** — real-time bidirectional communication
- **Redis** (`@socket.io/redis-adapter`) — pub/sub adapter for cross-instance event broadcasting
- **HTML/CSS/JS** — minimal frontend served as static files

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Redis](https://redis.io/) running locally on `127.0.0.1:6379` (default)

### Install

```bash
npm install
```

### Run

```bash
node server.js
```

Server starts on `http://localhost:3000` by default. Set `PORT` env var to change:

```bash
PORT=3001 node server.js
```

### Test with multiple instances

Open multiple terminals and start servers on different ports:

```bash
PORT=3000 node server.js
PORT=3001 node server.js
PORT=3002 node server.js
```

Open the frontend in multiple browser tabs — events emitted from one client are received by all clients across all server instances.

## Project Structure

```
socket-redis-app/
├── public/
│   └── index.html    # Frontend: button + chat
├── server.js         # Express + Socket.IO + Redis adapter
├── package.json
└── ReadMe.md
```

## Features

- **Button click** — broadcasts a `button-event` to all connected clients
- **Chat messaging** — broadcasts `chat-message` with sender ID, server port, and timestamp
- **Multi-instance** — Redis adapter ensures events propagate across all server nodes

## Events

| Client → Server   | Server → Client    | Payload                                   |
| ----------------- | ------------------ | ----------------------------------------- |
| `button-click`    | `button-event`     | `{ from, port, time }`                    |
| `chat-message`    | `chat-message`     | `{ from, port, message, time }`           |
