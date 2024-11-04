
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middlewares.js"

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

// // Add a test GET route
// router.get("/test", (req, res) => {
//     res.json({ message: "User routes are working!" });
// });

export default router;
