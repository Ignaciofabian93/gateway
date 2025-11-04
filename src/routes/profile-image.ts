import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import prisma from "../client/prisma";
import { getImagesConfig } from "../config/config";

const profileImageRouter = Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

profileImageRouter.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file received" });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Since the image is already processed and compressed in the web app,
    // we just need to save it to disk
    const imageBuffer = req.file.buffer;

    // Get environment-specific images configuration
    const imagesConfig = getImagesConfig();

    // Define upload directory for profile images based on environment
    const uploadDir = path.join(imagesConfig.basePath, "profile-images");

    // Check if user already has a profile image and delete it
    await deleteExistingProfileImage(userId, uploadDir);

    // Create unique filename
    const fileName = `profile-${userId}-${Date.now()}.jpg`;
    const filePath = path.join(uploadDir, fileName);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Write file to disk
    await fs.writeFile(filePath, imageBuffer);

    // Store relative path in database (without base URL)
    const imagePath = `/images/profile-images/${fileName}`;
    await updateUserProfileImage(userId, imagePath);

    console.log(`Profile image uploaded: ${fileName} for user: ${userId}`);

    res.json({
      message: "File uploaded and processed successfully",
      imagePath: imagePath,
      imageUrl: `${imagesConfig.baseUrl}${imagePath}`, // Send full URL in response for immediate use
      fileName: fileName,
      originalSize: req.file.size,
      processedSize: imageBuffer.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Function to delete existing profile image
async function deleteExistingProfileImage(userId: string, uploadDir: string) {
  try {
    console.log(`Attempting to delete existing profile image for user: ${userId}`);
    console.log(`Upload directory: ${uploadDir}`);

    // Get the current profile image from database
    const user = await prisma.seller.findUnique({
      where: { id: userId },
      select: {
        sellerType: true,
      },
    });

    if (user?.sellerType === "PERSON") {
      // If user is a person, check PersonProfile
      const personProfile = await prisma.personProfile.findFirst({
        where: { sellerId: userId },
        select: { profileImage: true },
      });
      if (personProfile?.profileImage) {
        // Extract filename from URL
        const urlParts = personProfile.profileImage.split("/");
        const existingFileName = urlParts[urlParts.length - 1];

        console.log(`Found existing profile image URL: ${personProfile.profileImage}`);
        console.log(`Extracted filename: ${existingFileName}`);

        // Check if the file exists and delete it
        const existingFilePath = path.join(uploadDir, existingFileName);
        console.log(`Attempting to delete file at: ${existingFilePath}`);

        try {
          await fs.access(existingFilePath); // Check if file exists
          await fs.unlink(existingFilePath); // Delete the file
          console.log(`Deleted existing profile image: ${existingFileName} for user: ${userId}`);
        } catch (error) {
          // File doesn't exist or couldn't be deleted - this is not critical
          console.warn(`Could not delete existing profile image ${existingFileName}:`, error);
        }
      }
    } else if (user?.sellerType === "STARTUP" || user?.sellerType === "COMPANY") {
      // If user is a startup or company, check BusinessProfile
      const businessProfile = await prisma.businessProfile.findFirst({
        where: { sellerId: userId },
        select: { logo: true },
      });
      if (businessProfile?.logo) {
        // Extract filename from URL
        const urlParts = businessProfile.logo.split("/");
        const existingFileName = urlParts[urlParts.length - 1];

        console.log(`Found existing business logo URL: ${businessProfile.logo}`);
        console.log(`Extracted filename: ${existingFileName}`);

        // Check if the file exists and delete it
        const existingFilePath = path.join(uploadDir, existingFileName);
        console.log(`Attempting to delete file at: ${existingFilePath}`);

        try {
          await fs.access(existingFilePath); // Check if file exists
          await fs.unlink(existingFilePath); // Delete the file
          console.log(`Deleted existing profile image: ${existingFileName} for user: ${userId}`);
        } catch (error) {
          // File doesn't exist or couldn't be deleted - this is not critical
          console.warn(`Could not delete existing profile image ${existingFileName}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error checking/deleting existing profile image:", error);
    // Don't throw error here - this shouldn't prevent new upload
  }
}

// Function to update user profile in database
async function updateUserProfileImage(userId: string, imagePath: string) {
  try {
    const user = await prisma.seller.findUnique({
      where: { id: userId },
      select: {
        sellerType: true,
      },
    });
    if (user?.sellerType === "PERSON") {
      const personProfile = await prisma.personProfile.findFirst({
        where: { sellerId: userId },
      });
      if (personProfile) {
        await prisma.personProfile.update({
          where: { sellerId: userId },
          data: { profileImage: imagePath },
        });
      } else {
        // If no PersonProfile exists, you might want to create one or handle this case
        console.warn(`No PersonProfile found for sellerId: ${userId}`);
        throw new Error("User profile not found");
      }
    } else if (user?.sellerType === "STARTUP" || user?.sellerType === "COMPANY") {
      const businessProfile = await prisma.businessProfile.findFirst({
        where: { sellerId: userId },
      });
      if (businessProfile) {
        await prisma.businessProfile.update({
          where: { sellerId: userId },
          data: { logo: imagePath },
        });
      }
    }
  } catch (error) {
    console.error("Database update error:", error);
    throw new Error("Failed to update user profile image in database");
  }
}

export default profileImageRouter;
