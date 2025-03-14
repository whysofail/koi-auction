import { AppDataSource } from "../config/data-source";
import Wishlist from "../entities/Wishlist";
import { PaginationOptions, applyPagination } from "../utils/pagination";

const repository = AppDataSource.getRepository(Wishlist);

const createBaseQuery = () =>
  repository
    .createQueryBuilder("wishlist")
    .leftJoin("wishlist.user", "user")
    .addSelect(["user.user_id", "user.username"])
    .leftJoinAndSelect("wishlist.auction", "auction")
    .leftJoin("auction.user", "auction_user")
    .addSelect(["auction_user.user_id", "auction_user.username"]);

const wishlistRepository = AppDataSource.getRepository(Wishlist).extend({
  async findUserWishlists(user_id: string, pagination?: PaginationOptions) {
    const qb = createBaseQuery().where("user.user_id = :user_id", { user_id });

    applyPagination(qb, pagination);

    const [wishlists, count] = await qb.getManyAndCount();
    return { wishlists, count };
  },
});

export default wishlistRepository;
