const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const Redis = require("ioredis");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow requests from any origin
        methods: ["GET", "POST"]
    }
});

// Create two separate Redis connections
const redisPublisher = new Redis({
    host: "redis", // Redis container name
    port: 6379,    // Default Redis port
});
const redisSubscriber = new Redis({
    host: "redis", // Redis container name
    port: 6379,    // Default Redis port
});

// Define a simple route for the root URL
app.get("/", (req, res) => {
    res.send("Whiteboard Backend is Running");
});

// When a user connects to the Socket.io server
io.on("connection", (socket) => {
    console.log("User connected");

    // Handle drawing events from clients
    socket.on("draw", (data) => {
        console.log("Draw event received from client:", data);
        redisPublisher.publish("draw-channel", JSON.stringify(data)); // Publish to Redis channel
    });

    // Sync updates from Redis to connected clients
    redisSubscriber.subscribe("draw-channel", (err) => {
        if (err) console.error("Redis subscription failed:", err);
    });
    redisSubscriber.on("message", (channel, message) => {
        const parsedMessage = JSON.parse(message);
        console.log("Broadcasting message to clients:", parsedMessage);
        io.emit("draw", parsedMessage); // Broadcast to all connected clients
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(5000, () => console.log("Backend running on port 5000"));
