import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ErrorResponse } from "../utility/response";
import { ProductService } from "../service/product-service";
import { ProductRepository } from "../repository/product-repository";
import "../utility"//database connection
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";

const service = new ProductService(new ProductRepository());

export const CreateProduct = middy(async(event: APIGatewayEvent,context: Context): Promise<APIGatewayProxyResult> => {
    return service.CreateProduct(event);
  }).use(jsonBodyParser());

export const GetProduct = middy(async (event: APIGatewayEvent,context: Context): Promise<APIGatewayProxyResult> => {
    return service.GetProduct(event);
  })

export const GetProducts = middy(async (event: APIGatewayEvent,context: Context): Promise<APIGatewayProxyResult> => {
    return service.GetProducts(event);
  })

export const GetSellerProducts = middy(async ( event: APIGatewayEvent,context: Context): Promise<APIGatewayProxyResult> => {
    return service.GetSellerProducts(event);
  });

export const EditProduct = middy(async (event: APIGatewayEvent,context: Context): Promise<APIGatewayProxyResult> => {
    return service.EditProduct(event);
  }).use(jsonBodyParser());

export const DeleteProduct = middy(async (event: APIGatewayEvent,context: Context): Promise<APIGatewayProxyResult> => {
    return service.DeleteProduct(event);
  });