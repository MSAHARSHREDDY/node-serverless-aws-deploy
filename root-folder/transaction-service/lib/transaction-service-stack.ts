

import * as cdk from "aws-cdk-lib";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { SubscriptionFilter, Topic } from "aws-cdk-lib/aws-sns";
import { SqsSubscription } from "aws-cdk-lib/aws-sns-subscriptions";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { ServiceStack } from "../lib/service-stack";
import { ApiGatewayStack } from "../lib/api-gateway-stack";

export class TransactionServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

     //Here we are creating a queue
    const orderQueue = new Queue(this, "order_queue", {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    //here we are getting the reference from SNS topic i.e order topic
    const orderTopic = Topic.fromTopicArn(
      this,
      "order_consume-Topic",
      cdk.Fn.importValue("customer-topic")//Here "customer-topic" is comming from user-service serverless.yaml from export
    );

    //here we are subscribing the queue 
    orderTopic.addSubscription(
      new SqsSubscription(orderQueue, {
        rawMessageDelivery: true,
        filterPolicy: {
          actionType: SubscriptionFilter.stringFilter({
            allowlist: ["place_order"],
          }),
        },
      })
    );

    //createOrder, getOrder, getOrders, getTransaction are all the lambda functions
    const { createOrder, getOrder, getOrders, getTransaction } =
      new ServiceStack(this, "transaction-service", {});
    createOrder.addEventSource(new SqsEventSource(orderQueue));

    new ApiGatewayStack(this, "transaction-api-gateway", {
      createOrder,
      getOrders,
      getOrder,
      getTransaction,
    });
  }
}
