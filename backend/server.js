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

    // Send stored canvas data to the newly connected user
    redisPublisher.get("canvasState", (err, canvasState) => {
        if (err) {
            console.error("Error retrieving canvas state from Redis:", err);
        } else if (canvasState) {
            socket.emit("canvasState", JSON.parse(canvasState)); // Send canvas state to the new user
        }
    });

    // Handle drawing events from clients
    socket.on("draw", (data) => {
        console.log("Draw event received from client:", data);
        
        // Update Redis with the latest canvas state
        redisPublisher.get("canvasState", (err, canvasState) => {
            let updatedCanvasState = [];
            if (!err && canvasState) {
                updatedCanvasState = JSON.parse(canvasState);
            }
            updatedCanvasState.push(data); // Append new draw event
            redisPublisher.set("canvasState", JSON.stringify(updatedCanvasState)); // Save updated state
        });

        // Publish to Redis channel for real-time updates
        redisPublisher.publish("draw-channel", JSON.stringify(data));
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

server.listen(5000, '0.0.0.0', () => console.log("Backend running on port 5000"));
