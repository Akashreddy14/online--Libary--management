
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import bookRoutes from "./routes/bookRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("Online Library Management System Backend Running!");
});

// MongoDB connection test
app.get("/api/db-check", async (req, res) => {
    try {
        const result = await mongoose.connection.db.command({
            ping: 1
        });

        res.json({
            success: true,
            message: "MongoDB Connected Successfully",
            database: mongoose.connection.name,
            ping: result.ok
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// BOOK ROUTES
app.use("/api/books", bookRoutes);

// Error handling
app.use((error, req, res, next) => {
    console.error(error);

    res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error"
    });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");
        console.log("Database:", mongoose.connection.name);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
};

startServer();
