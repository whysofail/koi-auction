import { setSeederFactory } from "typeorm-extension";
import User from "../../entity/User";

const UsersFactory = setSeederFactory(User, () => {
  const user = new User() as Pick<
    User,
    "username" | "email" | "password" | "role"
  >;

  return user;
});

export default UsersFactory;
