import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";

// Set storage destination and file naming
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    cb(null, "uploads/"); // Directory to store the uploaded files
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void,
  ) => {
    const fileName = Date.now() + path.extname(file.originalname); // Generate unique file name
    cb(null, fileName); // Use only the file name, without including the path
  },
});

// File filter to allow only image types (e.g., JPEG, PNG, GIF)
const fileFilter: multer.Options["fileFilter"] = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // If file type is allowed, proceed with upload
  } else {
    cb(new Error("Only image files are allowed!")); // Error if file type is not allowed
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Max file size 5MB
  },
});

export const uploadProofOfPayment = upload.single("proof_of_payment"); // Single file upload
