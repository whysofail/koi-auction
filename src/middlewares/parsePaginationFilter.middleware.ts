import { Request, Response, NextFunction } from "express";
import { FindOptionsWhere } from "typeorm";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      filters: FindOptionsWhere<unknown>;
      pagination: {
        page: number;
        limit: number;
      };
    }
  }
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const isValidNumber = (value: unknown): boolean => {
  if (value === "") return false;
  const num = Number(value);
  return !Number.isNaN(num) && num > 0;
};

export const parsePaginationAndFilters = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const {
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
      ...queryFilters
    } = req.query;

    const pagination = {
      page: isValidNumber(page) ? Number(page) : DEFAULT_PAGE,
      limit: isValidNumber(limit) ? Number(limit) : DEFAULT_LIMIT,
    };

    const filters: Record<string, unknown> = {};

    Object.entries(queryFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        filters[key] = value;
      }
    });

    req.filters = filters;
    req.pagination = pagination;

    next();
  } catch (error) {
    next(error);
  }
};
