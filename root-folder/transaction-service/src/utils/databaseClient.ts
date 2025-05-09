import { Client } from "pg";

export const DBClient = () => {
  const client = new Client({
    host: "ec2-52-91-81-127.compute-1.amazonaws.com",
    user: "transaction_service",
    database: "transaction_service",
    password: "transaction_service",
    port: 5432,
  });
  console.log(client);
  return client;
};
