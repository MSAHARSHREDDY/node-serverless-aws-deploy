/* Replace with your SQL commands */
CREATE TABLE "users" (
    "user_id" bigserial PRIMARY KEY,
    "phone" varchar NOT NULL,
    "email" varchar UNIQUE NOT NULL,
    "password" varchar NOT NULL,
    "salt" varchar NOT NULL,
    "user_type" varchar NOT NULL,
    "first_name" varchar,
    "last_name" varchar,
    "profile_pic" text,
    "verification_code" integer,
    "expiry" timestamptz,
    "verified" boolean NOT NULL DEFAULT FALSE,
    "created_at" timestamptz NOT NULL DEFAULT (now())
);

CREATE INDEX ON "users" ("phone")

---schema definition-----------

-- CREATE TABLE "users" (
--     This creates a table named users to store user-related information.
-- "user_id" bigserial PRIMARY KEY,
--     bigserial: A large auto-incrementing integer type.
--     PRIMARY KEY: Ensures unique identification of each user.
-- "phone" varchar NOT NULL,
--     varchar: Stores phone numbers as variable-length text.
--     NOT NULL: Ensures every user must have a phone number.
-- "email" varchar UNIQUE NOT NULL,
--     varchar: Stores email addresses as variable-length text.
--     UNIQUE: Ensures no two users can have the same email.
--     NOT NULL: Every user must have an email.
-- "password" varchar NOT NULL,
-- "salt" varchar NOT NULL,
-- "user_type" varchar NOT NULL,
--     varchar: Stores the role of the user (e.g., "admin", "customer").
--     NOT NULL: Ensures every user has a role.
-- "first_name" varchar,
-- "last_name" varchar,
--     varchar: Stores the user's first and last name.
--     Optional (nullable): These fields can be empty.
-- "profile_pic" text,
--     text: Stores a URL or base64-encoded profile picture.
--     Optional (nullable): The user may not have a profile picture.
-- "verification_code" integer,
--     integer: Stores a code used for email/phone verification.
--     Optional (nullable): Not required once the user is verified.
-- "expiry" timestamptz,
--     timestamptz: Stores the expiration time for the verification code.
-- "verified" boolean NOT NULL DEFAULT FALSE,
--     boolean: Stores whether the user has verified their email/phone.
--     NOT NULL: Ensures the field is always set.
--     DEFAULT FALSE: Users start as unverified.
-- "created_at" timestamptz NOT NULL DEFAULT (now())
--     timestamptz: Stores the date and time of user creation.
--     NOT NULL: Always recorded.
--     DEFAULT (now()): Automatically set when a user is added.

-- CREATE INDEX ON "users" ("phone")
--     Creates an index on the phone column to speed up searches by phone number.