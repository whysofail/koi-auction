/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from "express";
import { EntityOrderFields, SortOrder } from "../types/entityorder.types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

// Helper function to check if a value is a valid number
const isValidNumber = (value: unknown): boolean => {
  const num = Number(value);
  return !Number.isNaN(num) && num > 0;
};

// Type guard to validate sorting order
const isValidOrder = (value: unknown): value is SortOrder =>
  value === SortOrder.ASC || value === SortOrder.DESC;

// Middleware to parse pagination, filters, and ordering
export const parsePaginationAndFilters = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const {
      page = DEFAULT_PAGE,
      limit = DEFAULT_LIMIT,
      orderBy,
      order,
      ...queryFilters
    } = req.query;

    // Parse and validate pagination
    req.pagination = {
      page: isValidNumber(page) ? Number(page) : DEFAULT_PAGE,
      limit: isValidNumber(limit) ? Number(limit) : DEFAULT_LIMIT,
    };

    // Parse filters
    req.filters = Object.entries(queryFilters).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );

    // Parse and validate order
    req.order = {
      orderBy: orderBy as EntityOrderFields | undefined,
      order: isValidOrder(order) ? order : SortOrder.DESC,
    };

    next();
  } catch (error) {
    next(error);
  }
};
