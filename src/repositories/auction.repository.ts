import { AppDataSource as dataSource } from "../config/data-source";
import Auction from "../entities/Auction";

// TODO: Extend the auction repository with QueryBuilder for more complex queries
const auctionRepository = dataSource.getRepository(Auction);

export default auctionRepository;
