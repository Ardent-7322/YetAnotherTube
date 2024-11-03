import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import{ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  //validation - not empty
  //check if user already exists: username, email
  //check for images, check for avatar
  //upload them to cloudinary, avatar
  //create user object(no sql)- create entry in db
  //remove password and refresh token field from response
  // check for user creation

//   req.body = express provides
//   req.files = multer provides

  const { fullname, email, username, password } = req.body;
  console.log("email:", email);
  // is empty
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  //is already exists
  const existedUser = User.findOne({
    $or: [{ username }, { email }], //checking multiple queries matching
  });
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
   //storing path
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
// checkiing paths
if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
}
const avatar= await uploadOnCloudinary(avatarLocalPath)
const coverImage= await uploadOnCloudinary(coverImageLocalPath)
//is avatar uplaoded succesfully?
if(!avatar){
    throw new ApiError(400, "Avatar file is requried")
}

//Create object and db entry
User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage.url || "",//cover image is not neccesary
    email,
    password,
    username: username.toLowerCase(),

})
// checking is user created or not
const createdUser = await User.findById(User._id).select(
    "-password -refreshToken"
)

if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering user")
}

return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered succesfully.")
)
})

export { registerUser };
