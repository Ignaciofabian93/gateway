import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import prisma from "../client/prisma";
import { getImagesConfig } from "../config/config";

const coverImageRouter = Router();

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

coverImageRouter.post("/", upload.single("file"), async (req: Request, res: Response) => {
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
    console.log("images config:: ", imagesConfig);

    // Define upload directory for cover images based on environment
    const uploadDir = path.join(imagesConfig.basePath, "cover-images");

    // Check if user already has a cover image and delete it
    await deleteExistingCoverImage(userId, uploadDir);

    // Create unique filename
    const fileName = `cover-${userId}-${Date.now()}.jpg`;
    const filePath = path.join(uploadDir, fileName);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Write file to disk
    await fs.writeFile(filePath, imageBuffer);

    // Update user profile in database with new cover image URL
    const imageUrl = `${imagesConfig.baseUrl}/cover-images/${fileName}`;
    await updateUserCoverImage(userId, imageUrl);

    console.log(`Cover image uploaded: ${fileName} for user: ${userId}`);

    res.json({
      message: "File uploaded and processed successfully",
      imageUrl: imageUrl,
      fileName: fileName,
      originalSize: req.file.size,
      processedSize: imageBuffer.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Function to delete existing cover image
async function deleteExistingCoverImage(userId: string, uploadDir: string) {
  try {
    // Get the current cover image from database
    const personProfile = await prisma.personProfile.findFirst({
      where: { sellerId: userId },
      select: { coverImage: true },
    });

    if (personProfile?.coverImage) {
      // Extract filename from URL
      const urlParts = personProfile.coverImage.split("/");
      const existingFileName = urlParts[urlParts.length - 1];

      // Check if the file exists and delete it
      const existingFilePath = path.join(uploadDir, existingFileName);

      try {
        await fs.access(existingFilePath); // Check if file exists
        await fs.unlink(existingFilePath); // Delete the file
        console.log(`Deleted existing cover image: ${existingFileName} for user: ${userId}`);
      } catch (error) {
        // File doesn't exist or couldn't be deleted - this is not critical
        console.warn(`Could not delete existing cover image ${existingFileName}:`, error);
      }
    }
  } catch (error) {
    console.error("Error checking/deleting existing cover image:", error);
    // Don't throw error here - this shouldn't prevent new upload
  }
}

// Function to update user profile in database
async function updateUserCoverImage(userId: string, imageUrl: string) {
  try {
    // First try to update PersonProfile if it exists
    const personProfile = await prisma.personProfile.findFirst({
      where: { sellerId: userId },
    });

    if (personProfile) {
      await prisma.personProfile.update({
        where: { sellerId: userId },
        data: { coverImage: imageUrl },
      });
    } else {
      // If no PersonProfile exists, you might want to create one or handle this case
      console.warn(`No PersonProfile found for sellerId: ${userId}`);
      throw new Error("User profile not found");
    }
  } catch (error) {
    console.error("Database update error:", error);
    throw new Error("Failed to update user cover image in database");
  }
}

export default coverImageRouter;
