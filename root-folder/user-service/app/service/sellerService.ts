import { PaymentMethodInput, SellerProgramInput } from "app/models/dto/JoinSellerProgramInput";
import { SellerRepository } from "app/repository/sellerRepository";
import { AppValidationError } from "app/utility/errors";
import { GetToken, VerifyToken } from "app/utility/password";
import { ErrorResponse, SuccessResponse } from "app/utility/response";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { plainToClass } from "class-transformer";

export class SellerService {
  repositoryInfo: SellerRepository;
  constructor(repository: SellerRepository) {
    this.repositoryInfo = repository;
  }

  async JoinSellerProgram(event: APIGatewayProxyEventV2) {
    const authToken = event.headers.authorization;
    const payload = await VerifyToken(authToken);
    if (!payload) return ErrorResponse(403, "authorization failed!");

    const input = plainToClass(SellerProgramInput, event.body);
    const error = await AppValidationError(input);
    if (error) {
      return ErrorResponse(404, error);
    } else {
      // const firstName=input.firstName
      // const lastName=input.lastName
      // const phoneNumber=input.phoneNumber
      // const address=input.address
      /**Instead of writing like above we can write as */
      const { firstName, lastName, phoneNumber, address } = input;
      const enrolled = await this.repositoryInfo.CheckEnrolledProgram(
        payload.user_id
      );
      if (enrolled) {
        return ErrorResponse(
          403,
          "you have already enrolled for seller program! you can sell your products now!"
        );
      } else {
        //update user account
        const updatedUser = await this.repositoryInfo.UpdateProfile({
          firstName: firstName,
          lastName: lastName,
          phoneNumber: phoneNumber,
          user_id: payload.user_id,
        });
        if (!updatedUser) {
          return ErrorResponse(500, "error on joining seller program!");
        }

        //update Address
        await this.repositoryInfo.UpdateAddress({
          ...address,
          user_id: payload.user_id,
        });

        //create payment method
        const result = await this.repositoryInfo.CreatePaymentMethod({
          ...input,
          user_id: payload.user_id,
        });
        // signed token
        if (result) {
          const token = await GetToken(updatedUser);

          return SuccessResponse({
            message: "successfully joined seller program",
            seller: {
              token,
              email: updatedUser.email,
              firstName: updatedUser.first_name,
              lastName: updatedUser.last_name,
              phone: updatedUser.phone,
              userType: updatedUser.user_type,
              _id: updatedUser.user_id,
            },
          });
        } else {
          return ErrorResponse(500, "error on joining seller program!");
        }
      }
    }
  }

  async GetPaymentMethods(event: APIGatewayProxyEventV2) {
    const authToken=event.headers.authorization
    const payload=await VerifyToken(authToken)
    if(!payload) return ErrorResponse(403,"authorization failed")
    const paymentMethods = await this.repositoryInfo.GetPaymentMethods(payload.user_id);
    return SuccessResponse({ paymentMethods });
  }

  async EditPaymentMethod(event: APIGatewayProxyEventV2) {
    const authToken=event.headers.authorization
    const payload=await VerifyToken(authToken)
    if(!payload) return ErrorResponse(403,"authorization method")
    const input=plainToClass(PaymentMethodInput,event.body)
    const error = await AppValidationError(input);
    if (error) return ErrorResponse(404, error);
    const payment_id=Number(event.pathParameters.id)
//     Use curly braces {} when you're passing an object with properties (key-value pairs).in UpdatePaymentMethod

// Use parentheses () when calling functions or grouping expressions — not for constructing objects.
    const result=await this.repositoryInfo.UpdatePaymentMethod({...input,payment_id,user_id:payload.user_id})
    if (result) {
        return SuccessResponse({
          message: "payment method updated!",
        });
      } else {
        return ErrorResponse(500, "error on joining seller program!");
      }

  }
}
