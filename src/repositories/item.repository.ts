import { AppDataSource as dataSource } from "../config/data-source";
import Item from "../entities/Item";

// TODO: Extend the item repository with QueryBuilder for more complex queries
const itemRepository = dataSource.getRepository(Item);

export default itemRepository;
