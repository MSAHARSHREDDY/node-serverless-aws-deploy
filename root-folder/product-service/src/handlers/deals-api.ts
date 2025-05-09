import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export const DealsHandler=async(event:APIGatewayEvent,context:Context):Promise<APIGatewayProxyResult>=>{
    console.log(`Event: ${JSON.stringify(event)}`)
    console.log(`Context: ${JSON.stringify(context)}`)
    return{
        statusCode:200,
        body:JSON.stringify({
            message:"hello from deals service",
            path:`${event.path},${event.pathParameters} `
        })
    }
}