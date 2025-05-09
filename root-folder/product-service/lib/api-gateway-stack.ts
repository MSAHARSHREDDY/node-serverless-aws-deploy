import { aws_apigateway } from "aws-cdk-lib";
import { LambdaIntegration, LambdaRestApi, RestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { ServiceInterface } from "./serviceInterface";

// interface ApiGatewayStackProps {
//   productService: IFunction;
//   categoryService:IFunction;
//   dealsService:IFunction
//   imageService:IFunction
//   queueService:IFunction

// }

// interface ResourceType {
//   name: string;
//   methods: string[];
//   child?: ResourceType;
// }

// export class ApiGatewayStack extends Construct {
//   constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
//     super(scope, id);
//     this.addResource("product", props);
//   }

//   addResource(
//     serviceName: string,
//     {
//       categoryService,
//       productService,
//       dealsService,
//       imageService,
//       queueService
//     }: ApiGatewayStackProps
//   ) {
//     const apgw = new aws_apigateway.RestApi(this, `${serviceName}-ApiGtw`);

//     this.createEndpoints(productService, apgw, {
//       name: "product",
//       methods: ["GET", "POST"],
//       child: {
//         name: "{id}",
//         methods: ["GET", "PUT", "DELETE"],
//       },
//     });

//     this.createEndpoints(categoryService, apgw, {
//       name: "category",
//       methods: ["GET", "POST"],
//       child: {
//         name: "{id}",
//         methods: ["GET", "PUT", "DELETE"],
//       },
//     });

//     this.createEndpoints(dealsService, apgw, {
//       name: "deals",
//       methods: ["GET", "POST"],
//       child: {
//         name: "{id}",
//         methods: ["GET", "PUT", "DELETE"],
//       },
//     });

//     this.createEndpoints(imageService, apgw, {
//       name: "uploader",
//       methods: ["GET"],
//     });

//     this.createEndpoints(queueService, apgw, {
//       name: "products-queue",
//       methods: ["POST"],
//     });
//   }
  

//   createEndpoints(
//     handler: IFunction,
//     resource: RestApi,
//     { name, methods, child }: ResourceType
//   ) {
//     const lambdaFunction = new LambdaIntegration(handler);
//     const rootResource = resource.root.addResource(name);
//     methods.map((item) => {
//       rootResource.addMethod(item, lambdaFunction);
//     });

//     if (child) {
//       const childResource = rootResource.addResource(child.name);
//       child.methods.map((item) => {
//         childResource.addMethod(item, lambdaFunction);
//       });
//     }
//   }
// }


interface ApiGatewayStackProps {
  services: ServiceInterface;
}

type MethodType = "POST" | "GET" | "PUT" | "PATCH" | "DELETE";

interface Method {
  methodType: MethodType;
  handler: IFunction;
}

interface ResourceType {
  name: string;
  methods: Method[];
}

export class ApiGatewayStack extends Construct {
  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id);
    this.addResource("product", props);
  }

  addResource(serviceName: string, { services }: ApiGatewayStackProps) {
    const apgw = new aws_apigateway.RestApi(this, `${serviceName}-ApiGtw`);

    // product Endpoints
    const productResource = this.createEndpoints(apgw, {
      name: "product",
      methods: [
        {
          methodType: "POST",
          handler: services.CreateProduct,
        },
        {
          methodType: "GET",
          handler: services.GetProducts,
        },
      ],
    });

    this.addChildEndpoint(productResource, {
      name: "{id}",
      methods: [
        {
          methodType: "GET",
          handler: services.GetProduct,
        },
        {
          methodType: "PUT",
          handler: services.EditProduct,
        },
        {
          methodType: "DELETE",
          handler: services.DeleteProduct,
        },
      ],
    });

    this.createEndpoints(apgw, {
      name: "seller_products",
      methods: [
        {
          methodType: "GET",
          handler: services.GetSellerProducts,
        },
      ],
    });

    const categoryResource = this.createEndpoints(apgw, {
      name: "category",
      methods: [
        {
          methodType: "POST",
          handler: services.CreateCategory,
        },
        {
          methodType: "GET",
          handler: services.GetCategories,
        },
      ],
    });

    this.addChildEndpoint(categoryResource, {
      name: "{id}",
      methods: [
        {
          methodType: "GET",
          handler: services.GetCategory,
        },
        {
          methodType: "PUT",
          handler: services.EditCategory,
        },
        {
          methodType: "DELETE",
          handler: services.DeleteCategory,
        },
      ],
    });

    this.createEndpoints(apgw, {
      name: "deals",
      methods: [
        {
          methodType: "POST",
          handler: services.CreatDeals,
        },
      ],
    });

    this.createEndpoints(apgw, {
      name: "upload",
      methods: [
        {
          methodType: "POST",
          handler: services.ImageUploader,
        },
      ],
    });

    this.createEndpoints(apgw, {
      name: "products-queue",
      methods: [
        {
          methodType: "POST",
          handler: services.MessageQueueHandler,
        },
      ],
    });
  }

  createEndpoints(resource: RestApi, { name, methods }: ResourceType) {
    const rootResource = resource.root.addResource(name);
    methods.map((item) => {
      const lambdaFunction = new LambdaIntegration(item.handler);
      rootResource.addMethod(item.methodType, lambdaFunction);
    });
    return rootResource;
  }

  addChildEndpoint(
    rootResource: aws_apigateway.Resource,
    { name, methods }: ResourceType
  ) {
    const childResource = rootResource.addResource(name);
    methods.map((item) => {
      const lambdaFunction = new LambdaIntegration(item.handler);
      childResource.addMethod(item.methodType, lambdaFunction);
    });
  }
}
