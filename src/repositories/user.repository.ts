import { SelectQueryBuilder } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import User from "../entities/User";
import { applyPagination } from "../utils/pagination";
import { IUserFilter } from "../types/entityfilter";
// Function to apply filters to the User query
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
    pagination?: { page?: number; limit?: number },
  ) {
    const qb = this.createQueryBuilder("user")
      .leftJoinAndSelect("user.wallet", "wallet")
      .select([
        "user.user_id",
        "user.username",
        "user.email",
        "user.role",
        "user.registration_date",
        "wallet.wallet_id",
        "wallet.balance",
      ]);

    // Apply filters
    applyUserFilters(qb, filters);

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
