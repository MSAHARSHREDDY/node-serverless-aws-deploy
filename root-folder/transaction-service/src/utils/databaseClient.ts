import { Client } from "pg";

export const DBClient = () => {
  const client = new Client({
    host: "ec2-34-226-119-167.compute-1.amazonaws.com",
    user: "transaction_service",
    database: "transaction_service",
    password: "transaction_service",
    port: 5432,
  });
  console.log(client);
  return client;
};
