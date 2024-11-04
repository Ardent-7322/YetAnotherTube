import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

// Configure cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Check if file exists
        if (!fs.existsSync(localFilePath)) {
            console.log("File not found:", localFilePath);
            return null;
        }

        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // This will automatically detect file type
        });
        
        // Log success
        console.log("File uploaded successfully", response.url);
        
        // Remove file from local server
        fs.unlinkSync(localFilePath);
        
        return response;

    } catch (error) {
        console.log("Cloudinary upload error:", error);
        // Remove the locally saved temporary file as the upload operation failed
        if(localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
}

export { uploadOnCloudinary }