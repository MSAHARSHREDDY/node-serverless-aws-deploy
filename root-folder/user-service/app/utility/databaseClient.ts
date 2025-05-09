// /**It is automatically managed by aws */
// import { Client } from "pg";

// export const DBClient = () => {
//   return new Client({
//     host: "user-service.c47awawo6dzh.us-east-1.rds.amazonaws.com", //It is taken from RDS at the below you find connectivity and security copy that end point and paste here
//     user: "user_service",
//     database: "user_service",
//     password: "user_service",
//     port: 5432,
//     ssl: {
//       rejectUnauthorized: false, // Allows insecure SSL (okay for dev/test)
//     },
//   });
// };


/**It is managed manually by aws */

import { Client } from "pg";
export const DBClient = () => {
  return new Client({
    host: "ec2-52-91-81-127.compute-1.amazonaws.com", //It is taken from EC2 Instance from aws when you select that instance at below you find public IPV4 DNS ,copy that and paste in host
    user: "user_service",
    database: "user_service",
    password: "user_service",
    port: 5432,
    ssl: {
      rejectUnauthorized: false, // Allows insecure SSL (okay for dev/test)
    },
  });
};




/**When you are testing locally by using local db of postgres or by using docker postgres
 import { Client } from "pg";

export const DBClient = () => {
  return new Client({
    host: "127.0.0.1",
    user: "root",
    database: "user_service",
    password: "root",
    port: 5432,
  });
};

 */

// Setting	Safe?	Use case
// rejectUnauthorized: false	❌	Only for dev/testing
// rejectUnauthorized: true (default)	✅	Production + trusted certs
