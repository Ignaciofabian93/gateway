import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import prisma from "../client/prisma";
import { getImagesConfig } from "../config/config";

const marketPlaceImageRouter = Router();

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Sólo archivos de imagen están permitidos"));
    }
  },
});

marketPlaceImageRouter.post("/", upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" });
    }

    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "Se requiere el ID del producto" });
    }

    // Since the image is already processed and compressed in the web app,
    // we just need to save it to disk
    const imageBuffer = req.file.buffer;

    // Get environment-specific images configuration
    const imagesConfig = getImagesConfig();

    // Define upload directory for marketplace images based on environment
    const uploadDir = path.join(imagesConfig.basePath, "marketplace-images");

    // Check if product already has images and handle them
    await deleteExistingMarketplaceImage(productId, uploadDir);

    // Create unique filename
    const fileName = `marketplace-${productId}-${Date.now()}.jpg`;
    const filePath = path.join(uploadDir, fileName);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Write file to disk
    await fs.writeFile(filePath, imageBuffer);

    // Store relative path in database (without base URL)
    const imagePath = `/images/marketplace-images/${fileName}`;
    await updateProductMarketplaceImage(productId, imagePath);

    console.log(`Marketplace image uploaded: ${fileName} for product: ${productId}`);

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

// Function to delete existing marketplace image
async function deleteExistingMarketplaceImage(productId: string, uploadDir: string) {
  try {
    console.log(`Attempting to delete existing marketplace images for product: ${productId}`);
    console.log(`Upload directory: ${uploadDir}`);

    // Get the current product images from database
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      select: { images: true },
    });

    if (product?.images && product.images.length > 0) {
      // Delete all existing product images
      for (const imageUrl of product.images) {
        // Extract filename from URL
        const urlParts = imageUrl.split("/");
        const existingFileName = urlParts[urlParts.length - 1];

        console.log(`Found existing marketplace image URL: ${imageUrl}`);
        console.log(`Extracted filename: ${existingFileName}`);

        // Check if the file exists and delete it
        const existingFilePath = path.join(uploadDir, existingFileName);
        console.log(`Attempting to delete file at: ${existingFilePath}`);

        try {
          await fs.access(existingFilePath); // Check if file exists
          await fs.unlink(existingFilePath); // Delete the file
          console.log(`Deleted existing marketplace image: ${existingFileName} for product: ${productId}`);
        } catch (error) {
          // File doesn't exist or couldn't be deleted - this is not critical
          console.warn(`Could not delete existing marketplace image ${existingFileName}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error checking/deleting existing marketplace images:", error);
    // Don't throw error here - this shouldn't prevent new upload
  }
}

// Function to update product marketplace image in database
async function updateProductMarketplaceImage(productId: string, imagePath: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      select: { images: true },
    });

    if (product) {
      // Add new image to existing images array
      const updatedImages = [...(product.images || []), imagePath];

      await prisma.product.update({
        where: { id: parseInt(productId) },
        data: { images: updatedImages },
      });
    } else {
      console.warn(`No Product found for productId: ${productId}`);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error("Database update error:", error);
    throw new Error("Failed to update product marketplace image in database");
  }
}

export default marketPlaceImageRouter;
