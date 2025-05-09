import { ProfileInput } from "app/models/dto/AddressInput";
import { LoginInput } from "app/models/dto/LoginInput";
import { SignupInput } from "app/models/dto/Signup";
import { VerificationInput } from "app/models/dto/UpdateInput";
import { UserRepository } from "../repository/userRepository";
import { TimeDifference } from "app/utility/dateHelpers";
import { AppValidationError } from "app/utility/errors";
import { validate } from 'class-validator';

import {
  GenerateAccessCode,
  SendVerificationCode,
} from "app/utility/notification";
import {
  GetHashedPassword,
  GetSalt,
  GetToken,
  ValidatePassword,
  VerifyToken,
} from "app/utility/password";
import { ErrorResponse, SuccessResponse } from "app/utility/response";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { plainToClass, plainToInstance } from "class-transformer";
import { autoInjectable } from "tsyringe";

export class UserService {
   repository: UserRepository;
  constructor( repository: UserRepository) {
    this.repository = repository; //Here this.repository where repository name refers to the line number 5 it can be any name
  }

  async CreateUser(event: APIGatewayProxyEventV2) {
    try {
      const input = plainToInstance(SignupInput, event.body); //plainToClass converts object to class
      console.log("input data", input);
      const error = await AppValidationError(input);
      if (error) {
        return ErrorResponse(404, error);
      } else {
        const salt = await GetSalt();
        const hashPassword = await GetHashedPassword(input.password, salt);
        const data = await this.repository.CreateAccount({
          email: input.email,
          password: hashPassword,
          phone: input.phone,
          user_type: "BUYER",
          salt: salt,
        });
        return SuccessResponse(data);
      }
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  
  async UserLogin(event: APIGatewayProxyEventV2) {
    try {
      const input = plainToClass(LoginInput, event.body);
      const error = await AppValidationError(input);
      if (error) return ErrorResponse(404, error);
      const data = await this.repository.FindAccount(input.email);
      const verified = await ValidatePassword(
        input.password,
        data.password,
        data.salt
      );
      if (!verified) {
        throw new Error("password does not match!");
      }
      const token = GetToken(data);

      return SuccessResponse({
        token,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        userType: data.user_type,
        _id: data.user_id,
      });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }




  async GetVerificationToken(event: APIGatewayProxyEventV2) {

    try {
      const token = event.headers.authorization;
    const payload = await VerifyToken(token); //here it is decoding the token
    console.log("payload value", payload);
    if (payload) {
      const { code, expiry } = GenerateAccessCode();
      console.log(code, expiry);
      // save on DB to confirm verification
      await this.repository.updateVerificationCode(
        payload.user_id,
        code,
        expiry
      );
      const response = await SendVerificationCode(code, payload.phone);
      return SuccessResponse({
        message: "verification code is sent to your registered mobile number!",
      });
    } else {
      return ErrorResponse(403, "authorization failed");
    }
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
    
  }

  // async VerifyUser(event: APIGatewayProxyEventV2) {
  //   try {
  //     const token = event.headers.authorization;
  //     const payload = await VerifyToken(token); //here it is decoding the token
  //     if (payload) {
  //       const input = plainToClass(VerificationInput, event.body);
  //       const error = await AppValidationError(input);
  //       if (error) return ErrorResponse(404, error);
  
  //       const { verification_code, expiry } = await this.repository.FindAccount(
  //         payload.email
  //       );
  
  //       //above code can be written as
  //       // const account = await this.repository.FindAccount(payload.email);
  //       // const verification_code = account.verification_code;
  //       // const expiry = account.expiry;
  
  //       // find the user account
  //       if (verification_code === parseInt(input.code)) {
  //         // check expiry
  //         const currentTime = new Date();
  //         const diff = TimeDifference(expiry, currentTime.toISOString(), "m");
  //         console.log("time diff", diff);
  
  //         if (diff > 0) {
  //           console.log("verified successfully!");
  //           await this.repository.updateVerifyUser(payload.user_id);
  //         } else {
  //           return ErrorResponse(403, "verification code is expired!");
  //         }
  //       }
  //       return SuccessResponse({ message: "User Verified" });
  //     } else {
  //       return ErrorResponse(403, "authorization failed");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     return ErrorResponse(500, error);
  //   }
   
  // }


  async VerifyUser(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      const payload = await VerifyToken(token); // Decode the token
  
      if (payload) {
        // ✅ Ensure body is parsed
        const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
        const input = plainToInstance(VerificationInput, body);
  
        const error = await AppValidationError(input);
        if (error) return ErrorResponse(404, error);
  
        const { verification_code, expiry } = await this.repository.FindAccount(payload.email);
  
        if (verification_code === parseInt(input.code)) {
          const currentTime = new Date();
          const diff = TimeDifference(expiry, currentTime.toISOString(), "m");
          console.log("time diff", diff);
  
          if (diff > 0) {
            console.log("verified successfully!");
            await this.repository.updateVerifyUser(payload.user_id);
          } else {
            return ErrorResponse(403, "verification code is expired!");
          }
        }
  
        return SuccessResponse({ message: "User Verified" });
      } else {
        return ErrorResponse(403, "authorization failed");
      }
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }
  

  //user profile
  async CreateProfile(event: APIGatewayProxyEventV2) {
    try {
      console.log("event", event);
      const token = event.headers.authorization;
      const payload = await VerifyToken(token);
      console.log("payload value", payload);
      if (payload) {
        const input = plainToInstance(ProfileInput, event.body);
        console.log("input value",input)
        const error = await AppValidationError(input);
        if (error) {
          return ErrorResponse(404, error);
        } else {
          const result = await this.repository.CreateProfile(payload.user_id,input);
          console.log("result", result);
          return SuccessResponse({ message: "Profile created" });
        }
      } else {
        return ErrorResponse(403, "authorization failed");
      }
    } catch (error) {
      console.log(error)
      return ErrorResponse(500, error);
    }
  }

  async GetProfile(event: APIGatewayProxyEventV2) {
    try {
      const token=event.headers.authorization
      const payload=await VerifyToken(token)//It is used to 
      console.log("payload value",payload)
      if(payload){
        const result=await this.repository.GetUserProfile(payload.user_id)
        return SuccessResponse({ message: result });
      }
      else{
        throw ErrorResponse(403,"authorization failed")
      }
    } catch (error) {
      console.log(error)
      return ErrorResponse(500, error);
    }
    
  }

  // async EditProfile(event: APIGatewayProxyEventV2) {
  //   try {
  //     const token=event.headers.authorization
  //     const payload=await VerifyToken(token)
  //     if(payload){
  //       const input=plainToClass(ProfileInput,event.body)
  //       await this.repository.EditProfile(payload.user_id,input)
  //       return SuccessResponse({message:"profile updated"})
  //     }
  //     else{
  //       throw ErrorResponse(403,"authorization failed")

  //     }
  //   } catch (error) {
  //     console.log(error)
  //     return ErrorResponse(500,error)
  //   }
  // }

  async EditProfile(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      const payload = await VerifyToken(token);
      if (!payload) return ErrorResponse(403, "authorization failed!");

      const input = plainToInstance(ProfileInput, event.body);
      const error = await AppValidationError(input);
      if (error) return ErrorResponse(404, error);

      await this.repository.EditProfile(payload.user_id, input);
      return SuccessResponse({ message: "profile updated!" });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  //cart section
  async CreateCart(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from create cart" });
  }

  async GetCart(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from get cart" });
  }

  async UpdateCart(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from edit update cart" });
  }

  //Payment section
  async CreatePaymentMethod(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from create payment method" });
  }

  async GetPaymentMethod(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from get payment method" });
  }

  async UpdatePaymentMethod(event: APIGatewayProxyEventV2) {
    return SuccessResponse({ message: "response from update Payment Method" });
  }
}
