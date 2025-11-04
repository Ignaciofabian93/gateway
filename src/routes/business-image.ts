import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import prisma from "../client/prisma";
import { getImagesConfig } from "../config/config";

const businessImageRouter = Router();

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

businessImageRouter.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file received" });
    }

    const { itemId, itemType } = req.body;
    if (!itemId) {
      return res.status(400).json({ error: "Item ID is required" });
    }
    if (!itemType || !["storeProduct", "service"].includes(itemType)) {
      return res.status(400).json({ error: "Item type is required (storeProduct or service)" });
    }

    // Since the image is already processed and compressed in the web app,
    // we just need to save it to disk
    const imageBuffer = req.file.buffer;

    // Get environment-specific images configuration
    const imagesConfig = getImagesConfig();

    // Define upload directory for business images based on environment
    const uploadDir = path.join(imagesConfig.basePath, "business-images");

    // Check if item already has images and handle them
    await deleteExistingBusinessImage(itemId, itemType, uploadDir);

    // Create unique filename
    const fileName = `business-${itemType}-${itemId}-${Date.now()}.jpg`;
    const filePath = path.join(uploadDir, fileName);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Write file to disk
    await fs.writeFile(filePath, imageBuffer);

    // Store relative path in database (without base URL)
    const imagePath = `/images/business-images/${fileName}`;
    await updateBusinessImage(itemId, itemType, imagePath);

    console.log(`Business image uploaded: ${fileName} for ${itemType}: ${itemId}`);

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

// Function to delete existing business image
async function deleteExistingBusinessImage(itemId: string, itemType: string, uploadDir: string) {
  try {
    console.log(`Attempting to delete existing business images for ${itemType}: ${itemId}`);
    console.log(`Upload directory: ${uploadDir}`);

    let existingImages: string[] = [];

    if (itemType === "storeProduct") {
      const storeProduct = await prisma.storeProduct.findUnique({
        where: { id: parseInt(itemId) },
        select: { images: true },
      });
      existingImages = storeProduct?.images || [];
    } else if (itemType === "service") {
      const service = await prisma.service.findUnique({
        where: { id: parseInt(itemId) },
        select: { images: true },
      });
      existingImages = service?.images || [];
    }

    if (existingImages.length > 0) {
      // Delete all existing images
      for (const imageUrl of existingImages) {
        // Extract filename from URL
        const urlParts = imageUrl.split("/");
        const existingFileName = urlParts[urlParts.length - 1];

        console.log(`Found existing business image URL: ${imageUrl}`);
        console.log(`Extracted filename: ${existingFileName}`);

        // Check if the file exists and delete it
        const existingFilePath = path.join(uploadDir, existingFileName);
        console.log(`Attempting to delete file at: ${existingFilePath}`);

        try {
          await fs.access(existingFilePath); // Check if file exists
          await fs.unlink(existingFilePath); // Delete the file
          console.log(`Deleted existing business image: ${existingFileName} for ${itemType}: ${itemId}`);
        } catch (error) {
          // File doesn't exist or couldn't be deleted - this is not critical
          console.warn(`Could not delete existing business image ${existingFileName}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error checking/deleting existing business images:", error);
    // Don't throw error here - this shouldn't prevent new upload
  }
}

// Function to update business image in database
async function updateBusinessImage(itemId: string, itemType: string, imagePath: string) {
  try {
    if (itemType === "storeProduct") {
      const storeProduct = await prisma.storeProduct.findUnique({
        where: { id: parseInt(itemId) },
        select: { images: true },
      });

      if (storeProduct) {
        // Add new image to existing images array
        const updatedImages = [...(storeProduct.images || []), imagePath];

        await prisma.storeProduct.update({
          where: { id: parseInt(itemId) },
          data: { images: updatedImages },
        });
      } else {
        console.warn(`No StoreProduct found for itemId: ${itemId}`);
        throw new Error("Store product not found");
      }
    } else if (itemType === "service") {
      const service = await prisma.service.findUnique({
        where: { id: parseInt(itemId) },
        select: { images: true },
      });

      if (service) {
        // Add new image to existing images array
        const updatedImages = [...(service.images || []), imagePath];

        await prisma.service.update({
          where: { id: parseInt(itemId) },
          data: { images: updatedImages },
        });
      } else {
        console.warn(`No Service found for itemId: ${itemId}`);
        throw new Error("Service not found");
      }
    } else {
      throw new Error(`Invalid item type: ${itemType}`);
    }
  } catch (error) {
    console.error("Database update error:", error);
    throw new Error("Failed to update business image in database");
  }
}

export default businessImageRouter;
