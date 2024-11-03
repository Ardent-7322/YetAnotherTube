import {Router} from "express";
import {registerUser} from "../controller/user.controller.js";
const router = rexpress.Router()

// router.route("/register").post(registerUser)
router.post("/register", registerUser);
export default router;