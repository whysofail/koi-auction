import { SelectQueryBuilder } from "typeorm";
import { applyPagination } from "typeorm-extension";
import { AppDataSource as dataSource } from "../config/data-source";
import Warning from "../entities/Warning";
import { IWarningFilter } from "../types/entityfilter";
import { PaginationOptions } from "../utils/pagination";

// Function to apply filters to the Warning query
const applyWarningFilters = (
  qb: SelectQueryBuilder<Warning>,
  filters: IWarningFilter = {},
) => {
  if (filters.userId) {
    qb.andWhere("warning.user.user_id = :userId", { userId: filters.userId });
  }

  if (filters.reason) {
    qb.andWhere("warning.reason ILIKE :reason", {
      reason: `%${filters.reason}%`,
    });
  }

  if (filters.status) {
    qb.andWhere("warning.status = :status", {
      status: filters.status,
    });
  }

  if (filters.createdAtFrom) {
    qb.andWhere("warning.created_at >= :createdAtFrom", {
      createdAtFrom: filters.createdAtFrom,
    });
  }

  if (filters.createdAtTo) {
    qb.andWhere("warning.created_at <= :createdAtTo", {
      createdAtTo: filters.createdAtTo,
    });
  }

  return qb;
};

const warningRepository = dataSource.getRepository(Warning).extend({
  async getAllWarnings(
    filters?: IWarningFilter,
    pagination?: PaginationOptions,
  ) {
    const qb = this.createQueryBuilder("warning")
      .leftJoin("warning.user", "user")
      .select(["warning", "user.user_id", "user.username", "user.is_banned"])
      .addOrderBy("warning.created_at", "DESC");

    // Apply filters
    applyWarningFilters(qb, filters);
    applyPagination(qb, pagination);

    // Fetch results
    const [warnings, count] = await qb.getManyAndCount();
    return { warnings, count };
  },
});

export default warningRepository;
