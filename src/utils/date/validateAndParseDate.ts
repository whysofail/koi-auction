import { Request, Response } from "express";
import { sendErrorResponse } from "../response/handleResponse";
import { isValidDate } from "./validateDate";

const validateAndParseDates = (
  req: Request,
  res: Response,
): { start_datetime?: Date; end_datetime?: Date; valid: boolean } => {
  const { start_datetime, end_datetime } = req.query;

  // Check if start_datetime is valid
  if (start_datetime && !isValidDate(String(start_datetime))) {
    sendErrorResponse(res, "Invalid start_datetime format", 400);
    return { valid: false };
  }

  // Check if end_datetime is valid
  if (end_datetime && !isValidDate(String(end_datetime))) {
    sendErrorResponse(res, "Invalid end_datetime format", 400);
    return { valid: false };
  }

  // Successfully parsed and validated dates
  return {
    valid: true,
    start_datetime: start_datetime
      ? new Date(String(start_datetime)) // Convert to Date object
      : undefined,
    end_datetime: end_datetime ? new Date(String(end_datetime)) : undefined,
  };
};

export default validateAndParseDates;
