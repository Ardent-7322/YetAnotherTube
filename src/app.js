
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

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.path} not found`
    });
});

export { app };


// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";

// const app = express();

// app.use(
//   cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true,
//   })
// );

// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(express.static("public"));
// app.use(cookieParser());

// app.get("/test", (req, res) => {
//   res.send("Test route is working!");
// });

// //routes import 
// import userRouter from './routes/user.routes.js'

// //routes declaration
// app.use("/api/users", userRouter)

// export { app };