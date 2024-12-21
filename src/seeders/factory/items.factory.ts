/* eslint-disable radix */
import { setSeederFactory } from "typeorm-extension";
import { faker } from "@faker-js/faker";
import Item from "../../entities/Item";

const ItemsFactory = setSeederFactory(Item, () => {
  const item = new Item() as Omit<Item, "item_id" | "user">;
  item.item_name = faker.animal.fish();
  item.item_description = faker.commerce.productDescription();
  item.category = faker.food.ethnicCategory();
  item.starting_price = parseInt(faker.commerce.price());
  item.reserve_price = parseInt(faker.commerce.price());

  return item;
});

export default ItemsFactory;
