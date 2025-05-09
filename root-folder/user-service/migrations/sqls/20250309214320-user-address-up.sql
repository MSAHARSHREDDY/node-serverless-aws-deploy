/* Replace with your SQL commands */
CREATE TABLE "address" (
    "id" bigserial PRIMARY KEY,
    "user_id" bigint NOT NULL,/*bigint: Matches the user_id type in the users table.*/
    "address_line1" text,
    "address_line2" text,
    "city" varchar,
    "post_code" integer,
    "country" varchar,
    "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE INDEX ON "address" ("city");
CREATE INDEX ON "address" ("post_code");
CREATE INDEX ON "address" ("country");

-- Add Relation
ALTER TABLE "address" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");

---schema definition----
-- ALTER TABLE "address" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id")
--     Establishes a relationship between address and users.
--     An address must belong to a valid user in the users table.
--     If a user is deleted, their address can be restricted or cascaded depending on further constraints (not defined here).
