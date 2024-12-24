import { AppDataSource as dataSource } from "../config/data-source";
import Item from "../entities/Item";

// Get the basic repository for Item entity
const itemRepository = dataSource.getRepository(Item).extend({
  // Find item by its ID
  findItemById(item_id: string) {
    return this.createQueryBuilder("item")
      .where("item.item_id = :item_id", { item_id })
      .getOne();
  },

  // Find items by category
  findItemsByCategory(category: string) {
    return this.createQueryBuilder("item")
      .where("item.category = :category", { category })
      .getMany();
  },

  // Find items by condition
  findItemsByCondition(condition: string) {
    return this.createQueryBuilder("item")
      .where("item.condition = :condition", { condition })
      .getMany();
  },

  // Combine filters by category and condition
  findItemsByCategoryAndCondition(category: string, condition: string) {
    return this.createQueryBuilder("item")
      .where("item.category = :category", { category })
      .andWhere("item.condition = :condition", { condition })
      .getMany();
  },

  // Fetch items by user (seller)
  findItemsByUserId(user_id: string) {
    return this.createQueryBuilder("item")
      .innerJoin("item.user", "user")
      .where("user.user_id = :user_id", { user_id })
      .getMany();
  },

  // Fetch items within a price range
  findItemsByPriceRange(minPrice: number, maxPrice: number) {
    return this.createQueryBuilder("item")
      .where("item.starting_price BETWEEN :minPrice AND :maxPrice", {
        minPrice,
        maxPrice,
      })
      .getMany();
  },
});

export default itemRepository;
