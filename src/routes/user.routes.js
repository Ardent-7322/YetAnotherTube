
import { Router } from "express";
import { loginUser, logoutUser, registerUser ,refreshAccessToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/register").post(
    upload.fields([ //used middlerware now we can send images 
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount: 1
        }

    ]),
    registerUser
);

router.route("/login").post(loginUser)

//Secured routes

router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

// // Add a test GET route
// router.get("/test", (req, res) => {
//     res.json({ message: "User routes are working!" });
// });

export default router;
