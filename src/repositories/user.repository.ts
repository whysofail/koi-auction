import { SelectQueryBuilder } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import User from "../entities/User";
import { applyPagination, PaginationOptions } from "../utils/pagination";
import { IUserFilter } from "../types/entityfilter";
import { IUserOrder, SortOrder } from "../types/entityorder.types";

// Function to apply filters to the User query

export const applyUserOrdering = (
  qb: SelectQueryBuilder<User>,
  order?: IUserOrder, // Optional order parameter
) => {
  // Default ordering if no order is provided
  if (!order || !order.orderBy) {
    qb.addOrderBy("user.registration_date", SortOrder.DESC);
    return qb;
  }
  if (order.orderBy === "balance") {
    qb.orderBy("wallet.balance", order.order);
  }
  if (order.orderBy === "registration_date") {
    qb.orderBy("user.registration_date", order.order);
  }
  if (order.orderBy === "last_update") {
    qb.orderBy("user.last_update", order.order);
  }
  if (order.orderBy === "username") {
    qb.orderBy("user.username", order.order);
  }
  if (order.orderBy === "email") {
    qb.orderBy("user.email", order.order);
  }

  return qb;
};

export const applyUserFilters = (
  qb: SelectQueryBuilder<User>,
  filters: IUserFilter = {},
) => {
  if (filters.username) {
    qb.andWhere("user.username ILIKE :username", {
      username: `%${filters.username}%`,
    });
  }

  if (filters.email) {
    qb.andWhere("user.email ILIKE :email", {
      email: `%${filters.email}%`,
    });
  }

  if (filters.role) {
    qb.andWhere("user.role = :role", { role: filters.role });
  }

  // Fix the boolean filter for isBanned
  if (typeof filters.isBanned === "string") {
    const isBanned = filters.isBanned === "true";

    qb.andWhere("user.is_banned = :isBanned", {
      isBanned,
    });
  } else if (typeof filters.isBanned === "boolean") {
    qb.andWhere("user.is_banned = :isBanned", {
      isBanned: filters.isBanned,
    });
  }

  if (filters.registrationDateFrom) {
    qb.andWhere("user.registration_date >= :registrationDateFrom", {
      registrationDateFrom: filters.registrationDateFrom,
    });
  }
  if (filters.registrationDateTo) {
    qb.andWhere("user.registration_date <= :registrationDateTo", {
      registrationDateTo: filters.registrationDateTo,
    });
  }

  return qb;
};

const userRepository = dataSource.getRepository(User).extend({
  async getUsers(
    filters: IUserFilter = {},
    pagination?: PaginationOptions,
    order?: IUserOrder,
  ) {
    const qb = this.createQueryBuilder("user")
      .leftJoinAndSelect("user.wallet", "wallet")
      .select([
        "user.user_id",
        "user.username",
        "user.email",
        "user.phone",
        "user.role",
        "user.is_banned",
        "wallet.wallet_id",
        "wallet.balance",
        "user.registration_date",
      ]);

    // Apply filters
    applyUserFilters(qb, filters);
    // Apply ordering
    applyUserOrdering(qb, order);
    // Apply pagination
    applyPagination(qb, pagination);

    // Fetch results and count
    const [users, count] = await qb.getManyAndCount();
    return { users, count };
  },

  async findUserById(user_id: string) {
    const qb = this.createQueryBuilder("user")
      .where("user.user_id = :user_id", { user_id })
      .leftJoinAndSelect("user.wallet", "wallet")
      .leftJoinAndSelect("user.warnings", "warnings");

    return qb.getOne();
  },

  async findUserByUsername(username: string) {
    return this.findOne({ where: { username } });
  },

  async findUserByEmail(email: string) {
    return this.findOne({ where: { email } });
  },
});

export default userRepository;
