import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

// Define a type for the pagination parameter
export type PaginationOptions = {
  page?: number;
  limit?: number;
};

// Apply pagination function with the defined type
export const applyPagination = <T extends ObjectLiteral>(
  qb: SelectQueryBuilder<T>,
  pagination: PaginationOptions = {},
) => {
  const { page = 1, limit = 10 } = pagination;
  qb.skip((page - 1) * limit).take(limit);
};
