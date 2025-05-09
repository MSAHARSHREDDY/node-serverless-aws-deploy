import { APIGatewayEvent, Context } from "aws-lambda";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { DBOperation } from "./db-operation";

const dbOperation = new DBOperation();

export const getOrdersHandler = middy(
  async (event: APIGatewayEvent, context: Context) => {
    const queryString = "SELECT * FROM orders LIMIT 500";
    const result = await dbOperation.executeQuery(queryString, []);
    if (result?.rows && result.rows.length > 0) {
      return {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        statusCode: 201,
        body: JSON.stringify({ orders: result.rows[0] }),
      };
    }
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "orders not found" }),
    };
  }
).use(jsonBodyParser());

export const getOrderHandler = middy(
  async (event: APIGatewayEvent, context: Context) => {
    const { id } = event.pathParameters as any;
    const queryString =
      "SELECT * FROM orders o JOIN order_items oi ON o.id = oi.order_id WHERE user_id=$1";
    const result = await dbOperation.executeQuery(queryString, [id]);
    if (result?.rows && result.rows.length > 0) {
      return {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        statusCode: 201,
        body: JSON.stringify({ order: result.rows }),
      };
    }
    return {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      statusCode: 404,
      body: JSON.stringify({ message: "orders not found" }),
    };
  }
).use(jsonBodyParser());

/*
const orderResponse: Record<string, unknown>[] = [];

    const { Message } = event.body as any;

    try {
      const input = plainToClass(RawOrderInput, Message);
      const errors = await ValidateError(input);

      console.log(input);
      console.log(errors);

      if (!errors) {
        console.log("Record", input.items);
        const {
          amount,
          amount_received,
          capture_method,
          created,
          currency,
          customer,
          id,
          payment_method,
          payment_method_types,
          status,
        } = input.transaction;
        // create transaction
        const transactionQuery = `INSERT INTO transactions(
            amount,
            amount_received,
            capture_method,
            created,
            currency,
            customer,
            payment_id,
            payment_method,
            payment_method_types,
            status
             ) 
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;

        const transactionValues = [
          amount,
          amount_received,
          capture_method,
          created,
          currency,
          customer,
          id,
          payment_method,
          payment_method_types.toString(),
          status,
        ];
        console.log("EXECUTED!", transactionQuery);

        const transactionResult = await dbOperation.executeQuery(
          transactionQuery,
          transactionValues
        );

        console.log("RESULT", transactionResult);

        if (transactionResult.rowCount > 0) {
          const transaction_id = transactionResult.rows[0].id;
          const order_ref_number = Math.floor(10000 + Math.random() * 900000);
          const status = "received";
          // create order
          const orderQuery = `INSERT INTO orders(
                user_id,
                status,
                amount,
                transaction_id,
                order_ref_id
               )
              VALUES($1,$2,$3,$4,$5) RETURNING *`;

          const orderValues = [
            input.userId,
            status,
            amount,
            transaction_id,
            order_ref_number,
          ];
          const orderResult = await dbOperation.executeQuery(
            orderQuery,
            orderValues
          );
          const orderId = orderResult.rows[0].id;
          console.log("ORDER ID", orderId);
          // create order items
          if (Array.isArray(input.items)) {
            let itemInsertPromise = Array();
            input.items.map((item) => {
              const orderItemQuery = `INSERT INTO order_items(
                order_id,
                product_id,
                name,
                image_url,
                price,
                item_qty
               )
              VALUES($1,$2,$3,$4,$5,$6) RETURNING *`;

              const orderItemValue = [
                orderId,
                item.product_id,
                item.name,
                item.image_url,
                Number(item.price),
                item.item_qty,
              ];

              itemInsertPromise.push(
                dbOperation.executeQuery(orderItemQuery, orderItemValue)
              );
            });

            await Promise.all(itemInsertPromise);
          }
        }
      } else {
        orderResponse.push({ error: errors });
      }

      return {
        statusCode: 201,
        body: JSON.stringify({ orderResponse }),
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 503,
        body: JSON.stringify({ error }),
      };
    }
    */
