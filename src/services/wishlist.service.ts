import { ErrorHandler } from "../utils/response/handleError";
import wishlistRepository from "../repositories/wishlist.repository";
import { PaginationOptions } from "../utils/pagination";
import auctionRepository from "../repositories/auction.repository";

const getUserWishlists = async (
  user_id: string,
  pagination?: PaginationOptions,
) => {
  const { wishlists, count } = await wishlistRepository.findUserWishlists(
    user_id,
    pagination,
  );
  return { wishlists, count };
};

const addToWishlist = async (user_id: string, auction_id: string) => {
  // Check if auction exists
  const auction = await auctionRepository.findAuctionById(auction_id);
  if (!auction) {
    throw ErrorHandler.notFound(`Auction with ID ${auction_id} not found`);
  }

  // Check if already in wishlist
  const existing = await wishlistRepository.findOne({
    where: { user_id, auction_id },
  });
  if (existing) {
    throw ErrorHandler.badRequest("Auction already in wishlist");
  }

  const wishlist = await wishlistRepository.create({
    user_id,
    auction,
  });

  await wishlistRepository.save(wishlist);
  return wishlist;
};

const removeFromWishlist = async (user_id: string, auction_id: string) => {
  const wishlist = await wishlistRepository.findOne({
    where: { user_id, auction_id },
  });
  if (!wishlist) {
    throw ErrorHandler.notFound("Wishlist item not found");
  }

  await wishlistRepository.remove(wishlist);
  return { message: "Removed from wishlist" };
};

export const wishlistService = {
  getUserWishlists,
  addToWishlist,
  removeFromWishlist,
};
