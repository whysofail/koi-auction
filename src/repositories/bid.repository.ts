import { AppDataSource as dataSource } from "../config/data-source";
import Bid from "../entities/Bid";

// TODO: Extend the bid repository with QueryBuilder for more complex queries
const bidRepository = dataSource.getRepository(Bid);

export default bidRepository;
