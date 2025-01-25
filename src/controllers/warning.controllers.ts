import { RequestHandler, Request, Response } from "express";
import {
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
} from "../types/auth";
import { sendSuccessResponse } from "../utils/response/handleResponse";
import { warningService } from "../services/warning.service";

// Get All Warnings
export const getAllWarnings: RequestHandler = async (
  req: Request,
  res: Response,
  next,
) => {
  const { filters, pagination } = req;
  try {
    const { warnings, count } = await warningService.getAllWarnings(
      filters,
      pagination,
    );
    sendSuccessResponse(res, {
      data: warnings,
      count,
      page: pagination.page,
      limit: pagination.limit,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserWarnings: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { user } = req as AuthenticatedRequest;
  try {
    const warnings = await warningService.getWarningsByUserId(user.user_id);
    sendSuccessResponse(res, { data: warnings });
  } catch (error) {
    next(error);
  }
};

export const warnUser: RequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { user_id, reason } = req.body;
  try {
    const warning = await warningService.warnUser(user_id, reason);
    sendSuccessResponse(res, { data: warning });
  } catch (error) {
    next(error);
  }
};

export const updateWarning: RequestHandler = async (
  req: Request,
  res: Response,
  next,
) => {
  const { warning_id, reason } = req.body;
  try {
    const warning = await warningService.updateWarning(warning_id, reason);
    sendSuccessResponse(res, { data: warning });
  } catch (error) {
    next(error);
  }
};

export const deleteWarning: RequestHandler = async (
  req: Request,
  res: Response,
  next,
) => {
  const { warning_id } = req.body;
  try {
    const warning = await warningService.deleteWarning(warning_id);
    sendSuccessResponse(res, { data: warning });
  } catch (error) {
    next(error);
  }
};
