import {asyncHandler} from "../utils/asyncHandler.js";

const registerUser = async(req, res)=>{
    console.log("registeruser route reached");
    res.status(200).json({
        message:"ok"
    })
};

export {
    registerUser,
}