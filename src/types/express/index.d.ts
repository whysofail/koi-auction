// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from "express";
import { SortOrder } from "typeorm"; // Ensure this import if you're using TypeORM

declare global {
  namespace Express {
    interface Request {
      file?: MulterS3File; // Ensure the file is properly typed
      filters: Record<string, unknown>;

      pagination: {
        page: number;
        limit: number;
      };
      order: {
        orderBy?: string;
        order: SortOrder;
      };
    }
  }

  interface MulterS3File extends Express.Multer.File {
    key: string; // S3 file key (path in the bucket)
    location: string; // S3 public URL
    bucket: string; // S3 bucket name
    etag: string; // ETag of the uploaded file
  }
}

export {};
