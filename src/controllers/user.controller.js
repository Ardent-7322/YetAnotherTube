import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    // Check if user is found
    if (!user) {
      throw new Error("User not found for given ID");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessAndRefreshTokens:", error.message);
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  console.log("Request body:", req.body);
  console.log("Request files:", req.files);

  const { fullname, email, username, password } = req.body;

  if (!fullname || !email || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields must not be empty");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
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
    throw new ApiError(
      500,
      "Error uploading files to Cloudinary: " + error.message,
    );
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
    throw new ApiError(
      500,
      "Database error while creating user: " + error.message,
    );
  }

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

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
      "User registered successfully",
    ),
  );
});

//login user
const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  //username or email
  //find user
  //check password
  //access and refresh token generate
  //send cookies

  const { email, username, password } = req.body;

  // Check if at least one identifier is provided (username or email)
  if (!(username || email)) {
    throw new ApiError(400, "Username or email is required");
  }

  // Find user by either username or email
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found!!");
  }

  // Check if the provided password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  // Set options for cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  // Send response with user details and tokens
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            fullname: user.fullname,
            email: user.email,
            username: user.username,
          },
          accessToken,
          refreshToken,
        },
        "User logged in successfully",
      ),
    );
});

//Logout user

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

//Add refresh token endpoint

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

//Change Current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?.id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed succesfully"));
});

// Get current user

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "current user fetched successfully");
});

//update acc details

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!(fullname || email)) {
    throw new ApiError(400, "All fields are required");
  }

  const user = User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email: email,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, "Account details updated successfully"));
});

//Update file details

const updateUserAvatar = asyncHandler(async (req, req) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated succesfully "));
});

//update cover image
const updateUsercoverImage = asyncHandler(async (req, req) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "coverImage file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage image updated succesfully "));
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUsercoverImage,
};
