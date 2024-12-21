import { AppDataSource as dataSource } from "../config/data-source";
import User from "../entities/User";

// TODO: Extend the user repository with QueryBuilder for more complex queries
const userRepository = dataSource.getRepository(User);

export default userRepository;
