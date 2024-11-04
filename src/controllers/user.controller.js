import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


  
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
const registerUser = asyncHandler(async (req, res) => {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const { fullname, email, username, password } = req.body;

    if (!fullname || !email || !username || !password) {
        throw new ApiError(400, "All fields are required");
    }

    if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields must not be empty");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    let avatarLocalPath = req.files?.avatar?.[0]?.path;
    let coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    let avatar;
    let coverImage;

    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log("Avatar upload response:", avatar);

        if (coverImageLocalPath) {
            coverImage = await uploadOnCloudinary(coverImageLocalPath);
            console.log("Cover image upload response:", coverImage);
        }
    } catch (error) {
        throw new ApiError(500, "Error uploading files to Cloudinary: " + error.message);
    }

    if (!avatar) {
        throw new ApiError(400, "Error uploading avatar");
    }

    let user;
    try {
        user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "", // Use coverImage URL if available, else empty string
            email,
            password,
            username: username.toLowerCase(),
        });

        console.log("Created user:", user);

    } catch (error) {
        throw new ApiError(500, "Database error while creating user: " + error.message);
    }

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "User created but error fetching user details");
    }

    // Send response with fields ordered as desired
    return res.status(201).json(
        new ApiResponse(
            201,
            {
                fullname: createdUser.fullname,
                email: createdUser.email,
                username: createdUser.username,
                avatar: avatar.url,
                coverImage: coverImage?.url || "", // Placed just below avatar
            },
            "User registered successfully"
        )
    );
});

export{
  registerUser
};