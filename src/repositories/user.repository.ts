import { SelectQueryBuilder } from "typeorm";
import { AppDataSource as dataSource } from "../config/data-source";
import User from "../entities/User";

// Function to apply filters to the User query
export const applyUserFilters = (
  qb: SelectQueryBuilder<User>,
  filters: Partial<{
    username: string;
    email: string;
    role: string;
    registrationDateFrom: Date;
    registrationDateTo: Date;
  }> = {},
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

// Extend the User repository with custom methods
const userRepository = dataSource.getRepository(User).extend({
  async findUsers(
    filters?: Partial<{
      username: string;
      email: string;
      role: string;
      registrationDateFrom: Date;
      registrationDateTo: Date;
    }>,
  ) {
    const qb = this.createQueryBuilder("user")
      .leftJoinAndSelect("user.wallet", "wallet") // Include wallet relation if necessary
      .leftJoinAndSelect("user.items", "items"); // Include items relation if necessary

    applyUserFilters(qb, filters); // Apply filters dynamically

    // Execute the query and return the result
    return qb.getMany();
  },

  async findUserByUsername(username: string) {
    return this.findOne({ where: { username } });
  },

  async findUserById(user_id: string, filters?: any) {
    const qb = this.createQueryBuilder("user")
      .where("user.user_id = :user_id", { user_id })
      .leftJoinAndSelect("user.wallet", "wallet");

    applyUserFilters(qb, filters); // Apply additional filters if any

    // Execute the query and return the result
    return qb.getOne();
  },

  async findUserByEmail(email: string) {
    return this.findOne({ where: { email } });
  },
});

export default userRepository;
