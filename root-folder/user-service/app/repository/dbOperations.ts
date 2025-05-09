import { DBClient } from "../utility/databaseClient";

export class DBOperation {
  constructor() {}

  async executeQuery(queryString: string, values: unknown[]) {
    const client = await DBClient();//we are connectng to the database
    await client.connect();
    const result = await client.query(queryString, values);
    await client.end();
    return result;
  }
}
