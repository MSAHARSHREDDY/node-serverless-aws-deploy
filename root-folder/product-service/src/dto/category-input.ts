import { Length, length } from "class-validator";

export class CategoryInput {
  id: string;

  @Length(3, 128)
  name: string;

  parentId?: string;

  products: string[];

  displayOrder: number;

  imageUrl: string;
}

//when we are creating a product we need to inform that category that i am belongs to that category so for that i had written below code.
export class AddItemInput {
  @Length(3, 128)
  id: string;

  products: string[];
}