import { APIGatewayEvent } from "aws-lambda";
import { AddItemInput, CategoryInput } from "../dto/category-input";
import { categories, CategoryDoc } from "../models";
import path = require("path");

export class CategoryRepository {
  constructor() {}

  async CreateCategory({ name, parentId,imageUrl }: CategoryInput) {
    //craete a new category
    const newCategory = await categories.create({
      name,
      parentId,
      subCategories: [],
      products: [],
      imageUrl
    });
    //parentId exist
    //update parentCategory with new subcategory id
    if (parentId) {
      const parentCategory = (await categories.findById(
        parentId
      )) as CategoryDoc;
      console.log("parentCategory", parentCategory);
      parentCategory.subCategories = [
        ...parentCategory.subCategories,
        newCategory,
      ];
      await parentCategory.save();
    }
    //return newly create category
    return newCategory;
  }

  async GetAllCategories(offset = 0, perPage?: number) {
    return categories
      .find({
        parentId: null,
      })
      .populate({
        path: "subCategories",//here path refers to the name of the schema which is written in category model
        model: "categories", //here model means name of the model
        populate: {
          path: "subCategories",
          model: "categories",
        },
      })
      .skip(offset)
      .limit(perPage ? perPage : 100);
  }

  async GetTopCategories() {
    return categories
      .find(
        { parentId: { $ne: null } },
        {
          products: { $slice: 10 },
        }
      )
      .populate({
        path: "products",
        model: "products",
      })
      .sort({ displayOrder: "descending" })
      .limit(10);
  }

  async GetCategoryById(id: string, offset: number, perPage?: number) {
    return categories
      .findById(id, {
        products: {
          $slice: [offset, perPage ? perPage : 100],
        },
      })
      .populate({
        path: "products",
        model: "products",
      });
  }

  async UpdateCategory({id,name,displayOrder,imageUrl}:CategoryInput){
    const category=await categories.findById(id)as CategoryDoc
    console.log("category",category)
    category.name=name
    category.displayOrder=displayOrder
    category.imageUrl=imageUrl
    return category.save()
  }


  async DeleteCategory(id:string){
    return categories.deleteOne({_id:id})
  }

  async AddItem({id,products}:AddItemInput){
    let category=await categories.findById(id) as CategoryDoc
    console.log("category",category)
    category.products=[...category.products,...products]
    return category.save()
  }

  async RemoveItem({ id, products }: AddItemInput) {
    let category = (await categories.findById(id)) as CategoryDoc;
    const excludeProducts = category.products.filter(
      (item) => !products.includes(item)
    );
    category.products = excludeProducts;
    return category.save();
  }
}
