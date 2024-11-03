import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//access and set cookies of user from server i.e can perform CRUD operation

const app = express();

app.use(
  cors({
    origin: Process.env.CORS_ORIGIN,
    Credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit }));
app.use(express.static("public")); // we can store images(public assets) here
app.use(cookieParser());

//routes import 
import userRouter from './routes/user.routes.js'

//routes declaration
app.use(express.json());
app.use("api/v1/users", userRouter)

// http://localhost:8000/api/v1/users/register

export { app };
