import { APIGatewayEvent } from "aws-lambda";
import { ProductRepository } from "../repository/product-repository";
import { ErrorResponse, SucessResponse } from "../utility/response";
import { plainToClass } from "class-transformer";
import { ProductInput } from "../dto/product-input";
import { AppValidationError } from "../utility/errors";
import { CategoryRepository } from "../repository/category-repository";
import { ServiceInput } from "../dto/service-input";
import { AuthUser } from "../utility/auth";

export class ProductService {
  repositoryInfo: ProductRepository;
  constructor(repository: ProductRepository) {
    this.repositoryInfo = repository;
  }

  async AuthorisedUser(user_id:number,productId:string){
      const product=await this.repositoryInfo.GetProductById(productId)
      if(!product) return false
      //Here we are comparing specific product belongs to specific user or not
      return Number(user_id)===Number(product.seller_id)
  }

 
  
  async CreateProduct(event: APIGatewayEvent) {
    try {
      console.log("event",event)
      const token = event.headers.Authorization;
      console.log("token",token)
      const user = await AuthUser(token);
      if (!user) return ErrorResponse(403, "Authorization failed");

      if (user.user_type.toUpperCase() !== "SELLER") {
        return ErrorResponse(403, "You need to join the seller program to create products");
      }

      const input = plainToClass(ProductInput, event.body);
      const error = await AppValidationError(input);
      if (error) return ErrorResponse(400, error);

      // ✅ Create product in DB
      const product = await this.repositoryInfo.CreateProduct({
        ...input,
        seller_id: user.user_id,
      });

      // ✅ Add product ID to category
      await new CategoryRepository().AddItem({
        id: input.category_id,
        products: [product._id],
      });

      console.log("🟢 Product created and category updated:", product);

      return SucessResponse(product);
    } catch (err) {
      console.error("❌ Failed to create product:", err);
      return ErrorResponse(500, "Failed to create product");
    }
  }

  async GetProducts(event: APIGatewayEvent) {
    try {
      const data = await this.repositoryInfo.GetAllProducts();
      //body: { message: result }, // ❌ API Gateway expects a string, not an object
      return SucessResponse(data);
    } catch (error) {
      console.log(error);
      return ErrorResponse(404, error);
    }
  }

  async GetProduct(event: APIGatewayEvent) {
    console.log("event value",event)
    const productId=event.pathParameters?.id
    if(!productId){
        return ErrorResponse(403,"please provide product id")
    }
    const data=await this.repositoryInfo.GetProductById(productId)
    return SucessResponse(data);
  }

  async EditProduct(event: APIGatewayEvent) {

    //validate authorize user only
    const token=event.headers.Authorization
    const user=await AuthUser(token)
    if(!user) return ErrorResponse(403,"Authorization failed")
    if (user.user_type.toUpperCase() !== "SELLER") {
      return ErrorResponse(403,"you need to join the seller program to create product");
    }

    const productId = event.pathParameters?event.pathParameters.id:undefined;
    if (!productId) return ErrorResponse(403, "please provide product id");

    const input = plainToClass(ProductInput,event.body);
    const error = await AppValidationError(input);
    if (error) return ErrorResponse(404, error);

    const isAuthorised=await this.AuthorisedUser(user.user_id,productId)
    if(!isAuthorised) return ErrorResponse(403,"You are not authorized to edit the product")

    input.id = productId;
    const data = await this.repositoryInfo.UpdateProduct(input);

    return SucessResponse(data);
  }

  async DeleteProduct(event: APIGatewayEvent) {

     //validate authorize user only
     const token=event.headers.Authorization
     const user=await AuthUser(token)
     if(!user) return ErrorResponse(403,"Authorization failed")
     if (user.user_type.toUpperCase() !== "SELLER") {
       return ErrorResponse(403,"you need to join the seller program to create product");
     }

     
    console.log("event value",event)
    const productId=event.pathParameters?.id
    if(!productId){
        return ErrorResponse(403,"please provide product id")
    }

    const isAuthorised=await this.AuthorisedUser(user.user_id,productId)
    if(!isAuthorised) return ErrorResponse(403,"You are not authorized to delete the product")

    const {category_id,deleteResult}=await this.repositoryInfo.DeleteProduct(productId)
    await new CategoryRepository().RemoveItem({
      id: category_id,
      products: [productId],
    });
    return SucessResponse(deleteResult);
  }

  // http calls // later stage we will convert this thing to RPC & Queue
  async HandlerQueueOperation(event:APIGatewayEvent){
    const input=plainToClass(ServiceInput,event.body)
    const error=await AppValidationError(input)
    if(error) return ErrorResponse(404,error)
    console.log("input value",input)
    const {_id,name,price,image_url}=await this.repositoryInfo.GetProductById(input.productId)
    console.log("PRODUCT DETAILS", { _id, name, price, image_url });

    return SucessResponse({
      product_id: _id,
      name,
      price,
      image_url,
    });
  }

  async GetSellerProducts(event:APIGatewayEvent){
    try {
    const token = event.headers.Authorization;
    const user = await AuthUser(token);
    if (!user) return ErrorResponse(403, "authorization failed");

    if (user.user_type.toUpperCase() !== "SELLER") {
      return ErrorResponse(
        403,
        "you need to join the seller program to manage product"
      );
    }

    const data = await this.repositoryInfo.GetAllSellerProducts(user.user_id);
    return SucessResponse(data);
    } catch (error) {
      console.log(error)
      return ErrorResponse(404,error)
    }

  }
}

