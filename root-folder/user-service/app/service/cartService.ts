import { PullData } from "app/message-queue";
import { CartItemModel } from "app/models/CartItemModel";
import { CartInput, UpdateCartInput } from "app/models/dto/CartInput";
import { CartRepository } from "app/repository/cartRepository";
import { AppValidationError } from "app/utility/errors";
import { VerifyToken } from "app/utility/password";
import { ErrorResponse, SuccessResponse } from "app/utility/response";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { plainToClass } from "class-transformer";
// import aws from "aws-sdk";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { UserRepository } from "../repository/userRepository";
import {
  APPLICATION_FEE,
  CreatePaymentSession,
  RetrivePayment,
  STRIPE_FEE,
} from "../utility/payment";

export class CartService {
  repositoryInfo: CartRepository;
  constructor(repository: CartRepository) {
    this.repositoryInfo = repository;
  }

  async CreateCart(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      const payload = await VerifyToken(token);
      if (!payload) return ErrorResponse(403, "authorization failed!");

      const input = plainToClass(CartInput, event.body);
      const error = await AppValidationError(input);
      if (error) return ErrorResponse(404, error);

      let currentCart = await this.repositoryInfo.FindShoppingCart(
        payload.user_id
      );
      if (!currentCart)
        currentCart = await this.repositoryInfo.CreateShoppingCart(
          payload.user_id
        );

      if (!currentCart) {
        return ErrorResponse(500, "create cart is failed!");
      }

      // find the item if exist
      let currentProduct = await this.repositoryInfo.FindCartItemByProductId(
        input.productId
      );
      if (currentProduct) {
        // if exist update the qty
        await this.repositoryInfo.UpdateCartItemByProductId(
          input.productId,
          (currentProduct.item_qty += input.qty)
        );
      } else {
        // if does not call Product service to get product information
        const { data, status } = await PullData({
          action: "PULL_PRODUCT_DATA",
          productId: input.productId,
        });
        console.log("Getting Product", data);
        if (status !== 200) {
          return ErrorResponse(500, "failed to get product data!");
        }

        let cartItem = data.data as CartItemModel;
        cartItem.cart_id = currentCart.cart_id;
        cartItem.item_qty = input.qty;
        // Finally create cart item
        await this.repositoryInfo.CreateCartItems(cartItem);
      }

      // return all cart items to client
      const cartItems = await this.repositoryInfo.FindCartItemsByCartId(
        currentCart.cart_id
      );

      return SuccessResponse(cartItems);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async GetCart(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      const payload = await VerifyToken(token);
      if (!payload) return ErrorResponse(403, "authorization failed!");

      const cartItems = await this.repositoryInfo.FindCartItems(payload.user_id);

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.item_qty,
        0
      );

      const appFee = APPLICATION_FEE(totalAmount) + STRIPE_FEE(totalAmount);

      return SuccessResponse({ cartItems, totalAmount, appFee });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async UpdateCart(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      const payload = await VerifyToken(token);
      const cartItemId = Number(event.pathParameters.id);
      if (!payload) return ErrorResponse(403, "authorization failed");
      const input = plainToClass(UpdateCartInput, event.body);
      const error = await AppValidationError(input);
      if (error) return ErrorResponse(404, error);
      const cartItem = await this.repositoryInfo.UpdateCartItemById(
        cartItemId,
        input.qty
      );
      if (cartItem) {
        return SuccessResponse(cartItem);
      }
      return ErrorResponse(404, "item does not exist");
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async DeleteCart(event: APIGatewayProxyEventV2) {
    try {
      console.log("event", event);
      const token = event.headers.authorization;
      const payload = await VerifyToken(token);
      if (!payload) return ErrorResponse(403, "authorization failed!");
      const cartItemId = Number(event.pathParameters.id);
      const deletedItem = await this.repositoryInfo.DeleteCartItem(cartItemId);
      return SuccessResponse(deletedItem);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  // async CollectPayment(event:APIGatewayProxyEventV2){
  //   try {
  //     const token = event.headers.authorization;
  //     const payload = await VerifyToken(token);
  //     // initilize Payment gateway

  //     // authenticate payment confirmation

  //     // get cart items
  //     if (!payload) return ErrorResponse(403, "authorization failed!");
  //     const cartItems = await this.repositoryInfo.FindCartItems(payload.user_id);

  //     // Send SNS topic to create Order [Transaction MS] => email to user
  //     const params = {
  //       Message: JSON.stringify(cartItems),
  //       TopicArn: process.env.SNS_TOPIC,//It is comming from serverless.yaml file SNS.TOPIC
  //       MessageAttributes: {
  //         actionType: {
  //           DataType: "String",
  //           StringValue: "place_order",
  //         },
  //       },
  //     };
  //    const sns = new aws.SNS();
  //     const response = await sns.publish(params).promise();

  //     // Send tentative message to user

  //     return SuccessResponse({ msg: "Payment Processing...", response });
  //   } catch (error) {
  //     console.log(error);
  //     return ErrorResponse(500, error);
  //   }
  // }

  async CollectPayment(event: APIGatewayProxyEventV2) {
    try {
      const token = event.headers.authorization;
      const payload = await VerifyToken(token);
      if (!payload) return ErrorResponse(403, "authorization failed!");

      const { stripe_id, email, phone } =
        await new UserRepository().GetUserProfile(payload.user_id);
      const cartItems = await this.repositoryInfo.FindCartItems(
        payload.user_id
      );

      const total = cartItems.reduce(
        (sum, item) => sum + item.price * item.item_qty,
        0
      );

      const appFee = APPLICATION_FEE(total);
      const stripeFee = STRIPE_FEE(total);
      const amount = total + appFee + stripeFee;

      // initilize Payment gateway
      const { secret, publishableKey, customerId, paymentId } =
        await CreatePaymentSession({
          amount,
          email,
          phone,
          customerId: stripe_id,
        });

      await new UserRepository().UpdateUserPayment({
        userId: payload.user_id,
        customerId,
        paymentId,
      });

      return SuccessResponse({ secret, publishableKey });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async PlaceOrder(event: APIGatewayProxyEventV2) {
    try {
      // Get the authorization token from headers
      const token = event.headers.authorization;
      const payload = await VerifyToken(token); // Verify token and get payload
  
      // If no payload, return an authorization failure response
      if (!payload) return ErrorResponse(403, "Authorization failed!");
  
      // Get the payment_id from the user profile
      const { payment_id } = await new UserRepository().GetUserProfile(payload.user_id);
      console.log(payment_id);
  
      // Retrieve payment information using the payment_id
      const paymentInfo = await RetrivePayment(payment_id);
      console.log(paymentInfo);
  
      // Check if payment status is 'succeeded'
      if (paymentInfo.status === "succeeded") {
        // Get cart items for the user
        const cartItems = await this.repositoryInfo.FindCartItems(payload.user_id);
  
        // Prepare the parameters for the SNS message
        const params = {
          Message: JSON.stringify({
            userId: payload.user_id,
            items: cartItems,
            transaction: paymentInfo,
          }),
        };
  
        // Initialize SNS client
        const snsClient = new SNSClient({ region: "us-east-1" });
  
        // Create the SNS PublishCommand
        const command = new PublishCommand({
          Message: params.Message, // Use the params.Message here
          TopicArn: process.env.SNS_TOPIC, // Topic ARN from environment variable
          MessageAttributes: {
            actionType: {
              DataType: "String",
              StringValue: "place_order",
            },
          },
        });
  
        // Send the SNS message
        const response = await snsClient.send(command);
        console.log(response);
  
        // Return a success response with the SNS response
        return SuccessResponse({ msg: "Order placed successfully", response });
      } else {
        // If payment is not successful, return an error response
        return ErrorResponse(
          402,
          "Payment not completed. Status: " + paymentInfo.status
        );
      }
    } catch (error) {
      // Catch and log any errors
      console.log(error);
      return ErrorResponse(503, "Payment processing failed!");
    }
   
  }
}
