// import "reflect-metadata";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { UserRepository } from "app/repository/userRepository";
import { UserService } from "app/service/userService";
import { ErrorResponse } from "app/utility/response";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { container } from "tsyringe";


//const service = container.resolve(UserService);


const repository=new UserRepository()
const service=new UserService(repository)

export const Signup = middy((event: APIGatewayProxyEventV2) => {
  return service.CreateUser(event);
}).use(jsonBodyParser());


export const Login=middy((event:APIGatewayProxyEventV2)=>{
  return service.UserLogin(event)
}).use(jsonBodyParser())

export const GetVerificationCode = middy((event: APIGatewayProxyEventV2) => {
  return service.GetVerificationToken(event);
});

export const Verify = middy((event: APIGatewayProxyEventV2) => {
  return service.VerifyUser(event);
}).use(jsonBodyParser());

export const CreateProfile = middy((event: APIGatewayProxyEventV2) => {
  return service.CreateProfile(event);
}).use(jsonBodyParser());

export const EditProfile = middy((event: APIGatewayProxyEventV2) => {
  return service.EditProfile(event);
}).use(jsonBodyParser());

export const GetProfile = middy((event: APIGatewayProxyEventV2) => {
  return service.GetProfile(event);
});


export const Payment = middy((event: APIGatewayProxyEventV2) => {
const httpMethod = event.requestContext.http.method.toLowerCase();
  if (httpMethod === "post") {
    return service.CreatePaymentMethod(event);
  } else if (httpMethod === "get") {
    return service.GetPaymentMethod(event);
  } else if (httpMethod === "put") {
    return service.UpdatePaymentMethod(event);
  } else {
    return ErrorResponse(404, "request method is not supported");
  }
}).use(jsonBodyParser());
