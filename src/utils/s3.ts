import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3 from "../config/s3";

export const deleteFileFromS3 = async (key: string): Promise<void> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME, // The S3 bucket name
      Key: key, // The file key to delete
    });

    await s3.send(command); // Sending the delete command to S3
  } catch (error) {
    console.error("Error deleting file from S3:", error);
  }
};
