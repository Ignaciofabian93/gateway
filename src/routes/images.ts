import { Request, Response, Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import { getImagesConfig } from "../config/config";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = Router();
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

// Ensure directory exists
const ensureDirectoryExists = async (dirPath: string) => {
  try {
    await access(dirPath);
  } catch {
    await mkdir(dirPath, { recursive: true });
  }
};

// Configure multer for different upload types
const createMulterConfig = (subPath: string) => {
  return multer({
    storage: multer.diskStorage({
      destination: async (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void,
      ) => {
        const config = getImagesConfig();
        const uploadPath = path.join(config.basePath, subPath);
        await ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
      },
      filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      // Only allow images
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed!"));
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });
};

// Upload configurations for different types
const uploadDepartmentImage = createMulterConfig("departments");
const uploadProductImage = createMulterConfig("products");
const uploadUserImage = createMulterConfig("users");

// Routes for image uploads
router.post("/upload/department", uploadDepartmentImage.single("image"), (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const config = getImagesConfig();
    const imagePath = `/images/departments/${req.file.filename}`;

    res.json({
      success: true,
      imagePath,
      imageUrl: `${config.baseUrl}/departments/${req.file.filename}`,
    });
  } catch (error) {
    console.error("Error uploading department image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

router.post("/upload/product", uploadProductImage.single("image"), (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const config = getImagesConfig();
    const imagePath = `/images/products/${req.file.filename}`;

    res.json({
      success: true,
      imagePath,
      imageUrl: `${config.baseUrl}/products/${req.file.filename}`,
    });
  } catch (error) {
    console.error("Error uploading product image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

router.post("/upload/user", uploadUserImage.single("image"), (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const config = getImagesConfig();
    const imagePath = `/images/users/${req.file.filename}`;

    res.json({
      success: true,
      imagePath,
      imageUrl: `${config.baseUrl}/users/${req.file.filename}`,
    });
  } catch (error) {
    console.error("Error uploading user image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// Route to serve images (fallback if static serving doesn't work)
router.get("/:category/:filename", (req: Request, res: Response) => {
  try {
    const { category, filename } = req.params;
    const config = getImagesConfig();
    const imagePath = path.join(config.basePath, category, filename);
    console.log("image path:: ", imagePath);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.sendFile(imagePath);
  } catch (error) {
    console.error("Error serving image:", error);
    res.status(500).json({ error: "Failed to serve image" });
  }
});

export default router;
