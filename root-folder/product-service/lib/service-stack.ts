import { Duration } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import {NodejsFunction,NodejsFunctionProps,} from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import { ServiceInterface } from "./serviceInterface";

interface ServiceProps {
  bucket: string;
}

export class ServiceStack extends Construct {
  public readonly services: ServiceInterface;

  constructor(scope: Construct, id: string, props: ServiceProps) {
    super(scope, id);

    const funProps: NodejsFunctionProps = {
      bundling: {
        externalModules: [],/*Here we are including "aws-sdk" as we are running on nodejs20*/
      },
      environment: {
        BUCKET_NAME: props.bucket,
      },
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(10),
    };

    this.services = {
      CreateProduct: this.createHandler(funProps, "CreateProduct"),
      EditProduct: this.createHandler(funProps, "EditProduct"),
      DeleteProduct: this.createHandler(funProps, "DeleteProduct"),
      GetProduct: this.createHandler(funProps, "GetProduct"),
      GetProducts: this.createHandler(funProps, "GetProducts"),
      GetSellerProducts: this.createHandler(funProps, "GetSellerProducts"),

      CreateCategory: this.createHandler(funProps, "CreateCategory"),
      EditCategory: this.createHandler(funProps, "EditCategory"),
      DeleteCategory: this.createHandler(funProps, "DeleteCategory"),
      GetCategory: this.createHandler(funProps, "GetCategory"),
      GetCategories: this.createHandler(funProps, "GetCategories"),

      CreatDeals: this.createHandler(funProps, "CreateDeals"),

      ImageUploader: this.createHandler(funProps, "ImageUploader"),
      MessageQueueHandler: this.createHandler(funProps, "MessageQueueHandler"),
    };
  }

  createHandler(props: NodejsFunctionProps, handler: string): NodejsFunction {
    return new NodejsFunction(this, handler, {
      entry: join(__dirname, "/../src/handlers/index.ts"),
      handler: handler,
      ...props,
    });
  }
}
