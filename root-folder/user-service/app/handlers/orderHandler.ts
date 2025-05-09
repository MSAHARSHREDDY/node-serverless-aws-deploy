import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { CartRepository } from "app/repository/cartRepository";
import { CartService } from "app/service/cartService";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import dotenv from "dotenv";
dotenv.config();

const cartService=new CartService(new CartRepository())

export const CollectPayment=middy((event:APIGatewayProxyEventV2)=>{
    return cartService.CollectPayment(event)
})

export const PlaceOrder=middy((event:APIGatewayProxyEventV2)=>{
    return cartService.PlaceOrder(event)
})