import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { SellerRepository } from "app/repository/sellerRepository";
import { SellerService } from "app/service/sellerService";
import { APIGatewayProxyEventV2 } from "aws-lambda";

const repository=new SellerRepository()
const service=new SellerService(repository)
export const JoinSellerProgram=middy((event:APIGatewayProxyEventV2)=>{
    return service.JoinSellerProgram(event)
}).use(jsonBodyParser())

export const GetPaymentMethods=middy((event:APIGatewayProxyEventV2)=>{
    return service.GetPaymentMethods(event)
})

export const EditPaymentMethods=middy((event:APIGatewayProxyEventV2)=>{
    return service.EditPaymentMethod(event)
}).use(jsonBodyParser())