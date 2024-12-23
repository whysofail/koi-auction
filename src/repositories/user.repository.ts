import { AppDataSource as dataSource } from "../config/data-source";
import User from "../entities/User";

const userRepository = dataSource.getRepository(User).extend({
  findUserById(user_id: string) {
    return this.createQueryBuilder("user")
      .where("user.user_id = :user_id", { user_id })
      .getOne();
  },

  findUserByEmail(email: string) {
    return this.createQueryBuilder("user")
      .where("user.email = :email", { email })
      .getOne();
  },
});

export default userRepository;
