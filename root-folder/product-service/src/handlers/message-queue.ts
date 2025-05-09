import middy from "@middy/core"
import jsonBodyParser from "@middy/http-json-body-parser"
import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { ProductService } from "../service/product-service"
import { ProductRepository } from "../repository/product-repository"
import "../utility";//database connection

const service=new ProductService(new ProductRepository())
export const MessageQueueHandler=middy((event:APIGatewayEvent,context:Context):Promise<APIGatewayProxyResult>=>{
    return service.HandlerQueueOperation(event)
}).use(jsonBodyParser())