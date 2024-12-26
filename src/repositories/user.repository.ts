import { AppDataSource as dataSource } from "../config/data-source";
import User from "../entities/User";

const userRepository = dataSource.getRepository(User).extend({
  // Fetch a user by ID, always include the wallet relationship
  findUserById(user_id: string) {
    return this.findOne({
      where: { user_id },
      relations: ["wallet"], // Ensure wallet relationship is always loaded
    });
  },

  // Fetch a user by email, always include the wallet relationship
  findUserByEmail(email: string) {
    return this.findOne({
      where: { email },
      relations: ["wallet"], // Ensure wallet relationship is always loaded
    });
  },
});

export default userRepository;
