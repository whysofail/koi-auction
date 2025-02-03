import { RequestHandler, Request, Response } from "express";
import {
  AuthenticatedRequest,
  AuthenticatedRequestHandler,
} from "../types/auth";
import { sendSuccessResponse } from "../utils/response/handleResponse";
import { warningService } from "../services/warning.service";
import User from "../entities/User";

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

export const getWarningById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  try {
    const warning = await warningService.getAllWarnings({ warningId: id });
    sendSuccessResponse(res, { data: warning.warnings });
  } catch (error) {
    next(error);
  }
};

export const getWarningByUserId: RequestHandler = async (req, res, next) => {
  const { user_id } = req.params;
  try {
    const { warnings, count } =
      await warningService.getWarningsByUserId(user_id);
    sendSuccessResponse(res, {
      data: warnings,
      count,
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
    const { warnings, count } = await warningService.getWarningsByUserId(
      user.user_id,
    );
    sendSuccessResponse(res, {
      data: warnings,
      count,
    });
  } catch (error) {
    next(error);
  }
};

export const warnUser: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
): Promise<void> => {
  const { user } = req as AuthenticatedRequest; // Admin (fully populated)
  const { user_id, reason } = req.body;

  try {
    // Pass the full user object (admin) instead of just an object with `user_id`
    const warning = await warningService.warnUser(user_id, {
      reason,
      admin: user as User,
    });

    sendSuccessResponse(res, { data: warning });
  } catch (error) {
    next(error);
  }
};

export const updateWarning: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
) => {
  const { user } = req as AuthenticatedRequest;
  const { warning_id, reason } = req.body;
  const data = { warning_id, reason, admin_id: user.user_id };
  try {
    const warning = await warningService.updateWarning(warning_id, data);
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

export const banUser: AuthenticatedRequestHandler = async (req, res, next) => {
  const { user_id } = req.params;
  const { user } = req as AuthenticatedRequest; // Admin
  const { reason } = req.body;
  const data = { reason, admin: user as User };
  try {
    const response = await warningService.banUser(user_id, data);
    sendSuccessResponse(res, { data: response });
  } catch (error) {
    next(error);
  }
};

export const liftBanUser: AuthenticatedRequestHandler = async (
  req: Request,
  res: Response,
  next,
) => {
  const { user_id } = req.params;
  try {
    const response = await warningService.unbanUser(user_id);
    sendSuccessResponse(res, { data: response });
  } catch (error) {
    next(error);
  }
};
