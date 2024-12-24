import { Response } from "express";

export const sendSuccessResponse = (
  res: Response,
  data: any,
  count?: number,
) => {
  res.status(200).json({ data, count });
};

export const sendErrorResponse = (
  res: Response,
  message: string,
  statusCode: number = 500,
) => {
  res.status(statusCode).json({ message });
};
