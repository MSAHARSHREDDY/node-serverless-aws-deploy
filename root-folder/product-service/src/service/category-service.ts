import { APIGatewayEvent } from "aws-lambda";
import { CategoryRepository } from "../repository/category-repository";
import { ErrorResponse, SucessResponse } from "../utility/response";
import { plainToClass } from "class-transformer";
import { CategoryInput } from "../dto/category-input";
import { AppValidationError } from "../utility/errors";
import { error } from "console";

export class CategoryService{
    respositoryInfo:CategoryRepository
    constructor(repository:CategoryRepository){
        this.respositoryInfo=repository
    }

    async CreateCategory(event:APIGatewayEvent){
        const input=plainToClass(CategoryInput,(event.body))
        console.log("input value",input)
        const error=await AppValidationError(input)
        if(error){
            return ErrorResponse(404,error)
        }
        else{
            const data=await this.respositoryInfo.CreateCategory(input)
            return SucessResponse(data)
        }
    }

    async GetCategories(event: APIGatewayEvent) {
        const type = event.queryStringParameters?.type;
        console.log("type",type)
        if (type === "top") {
          const data = await this.respositoryInfo.GetTopCategories();
          return SucessResponse(data);
        }
        const data = await this.respositoryInfo.GetAllCategories();
        return SucessResponse(data);
      }

    async GetCategory(event:APIGatewayEvent){
        //const categoryId = event.pathParameters?.id;
        const categoryId = event.pathParameters ? event.pathParameters.id : null;
        console.log("event",event)
        const offset = Number(event.queryStringParameters?.offset);
        const perPage = Number(event.queryStringParameters?.perPage);
        if(!categoryId){
            return ErrorResponse(404,error)
        }
        else{
            const data=await this.respositoryInfo.GetCategoryById( categoryId,
                offset,
                perPage)
            return SucessResponse(data)
        }
    }

    async EditCategory(event:APIGatewayEvent){
        const categoryId=event.pathParameters?.id
        if(!categoryId) return ErrorResponse(404,"please provide category id")
        const input=plainToClass(CategoryInput,(event.body))
        const error=await AppValidationError(input)
        input.id=categoryId
        const data=await this.respositoryInfo.UpdateCategory(input)
        return SucessResponse(data)
    }

    async DeleteCategory(event:APIGatewayEvent){
        const categoryId=event.pathParameters?.id
        if(!categoryId) return ErrorResponse(404,"please provide categoryId")
        const data=await this.respositoryInfo.DeleteCategory(categoryId)
        return SucessResponse(data)
    }

    async ResponseWithError(event:APIGatewayEvent){
        return ErrorResponse(404,new Error("Method not allowed"))
    }  
}