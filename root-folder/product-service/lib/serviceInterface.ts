import { IFunction } from "aws-cdk-lib/aws-lambda";

export interface ServiceInterface {
  // products
  readonly CreateProduct: IFunction;
  readonly EditProduct: IFunction;
  readonly GetProducts: IFunction; // customer
  readonly GetSellerProducts: IFunction;
  readonly GetProduct: IFunction; // customer / seller
  readonly DeleteProduct: IFunction;

  // categories
  readonly CreateCategory: IFunction;
  readonly EditCategory: IFunction;
  readonly GetCategories: IFunction;
  readonly GetCategory: IFunction;
  readonly DeleteCategory: IFunction;

  // deals
  readonly CreatDeals: IFunction;

  // others
  readonly ImageUploader: IFunction;
  readonly MessageQueueHandler: IFunction;
}
