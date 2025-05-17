import "reflect-metadata";
import { Duration } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";

interface ServiceProps {}

export class ServiceStack extends Construct {
  public readonly createOrder: NodejsFunction;
  public readonly getOrder: NodejsFunction;
  public readonly getOrders: NodejsFunction;
  public readonly getTransaction: NodejsFunction;

  constructor(scope: Construct, id: string, props: ServiceProps) {
    super(scope, id);

    const functionProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [],/*Here we are including "aws-sdk" as we are running on nodejs20*/
        forceDockerBundling: false,
      },
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(180),
    };
    this.createOrder = this.createHandlers(functionProps, "createOrderHandler");
    this.getOrder = this.createHandlers(functionProps, "getOrderHandler");
    this.getOrders = this.createHandlers(functionProps, "getOrdersHandler");
    this.getTransaction = this.createHandlers(
      functionProps,
      "getTransactionHandler"
    );
  }

  createHandlers(props: NodejsFunctionProps, handler: string): NodejsFunction {
    return new NodejsFunction(this, handler, {
      entry: join(__dirname, "/../src/handlers/index.ts"),
      handler: handler,
      ...props,
    });
  }
}
