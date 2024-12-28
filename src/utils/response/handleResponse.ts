import { Response } from "express";

// Generic response wrapper to ensure a consistent format for success and error responses
class ApiResponse<T> {
  constructor(
    public status: "success" | "error",
    public message: string,
    public data?: T,
    public count?: number,
  ) {}
}

export const sendSuccessResponse = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
): void => {
  const response = {
    status: "success",
    message: "Request was successful",
    ...data,
  };
  res.status(statusCode).json(response);
};

// Error response handler with dynamic status code
export const sendErrorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500, // Default to 500 if not provided
): void => {
  const response = new ApiResponse<null>("error", message);
  res.status(statusCode).json(response);
};
