
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Request Body:', req.body);
    next();
});

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
    })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Test route to verify server is working
app.get("/", (req, res) => {
    res.json({ message: "Server is running!" });
});

// Import routes
import userRouter from './routes/user.routes.js'

// Route mounting - Note the starting slash
app.use("/api/users", userRouter);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
    })
})

export { app };

