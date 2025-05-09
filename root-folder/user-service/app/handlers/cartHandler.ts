import "reflect-metadata";
import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { CartRepository } from "app/repository/cartRepository";
import { CartService } from "app/service/cartService";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import dotenv from "dotenv";
dotenv.config();

const service=new CartService(new CartRepository())
export const CreateCart=middy((event:APIGatewayProxyEventV2)=>{
    return service.CreateCart(event)
}).use(httpJsonBodyParser())

export const DeleteCart=middy((event:APIGatewayProxyEventV2)=>{
    return service.DeleteCart(event)
}).use(httpJsonBodyParser())

export const EditCart=middy((event:APIGatewayProxyEventV2)=>{
    return service.UpdateCart(event)
}).use(httpJsonBodyParser())

export const GetCart=middy((event:APIGatewayProxyEventV2)=>{
    return service.GetCart(event)
})