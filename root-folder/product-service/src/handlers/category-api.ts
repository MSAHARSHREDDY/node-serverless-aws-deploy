import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";


import "../utility";//database connection
import { CategoryRepository } from "../repository/category-repository";
import { CategoryService } from "../service/category-service";
import middy from "@middy/core";
import bodyParser from "@middy/http-json-body-parser";
const service = new CategoryService(new CategoryRepository());

export const CreateCategory=middy((event:APIGatewayEvent,context:Context): Promise<APIGatewayProxyResult>=>{
    return service.CreateCategory(event)
}).use(bodyParser())


export const GetCategory=middy((event:APIGatewayEvent,context:Context):Promise<APIGatewayProxyResult>=>{
    return service.GetCategory(event)
})

export const GetCategories=middy((event:APIGatewayEvent,context:Context):Promise<APIGatewayProxyResult>=>{
    return service.GetCategories(event)
})

export const EditCategory=middy((event:APIGatewayEvent,context:Context):Promise<APIGatewayProxyResult>=>{
    return service.EditCategory(event)
}).use(bodyParser())

export const DeleteCategory=middy((event:APIGatewayEvent,context:Context):Promise<APIGatewayProxyResult>=>{
    return service.DeleteCategory(event)
})