/* Replace with your SQL commands */
ALTER TABLE IF EXISTS "address" DROP CONSTRAINT IF EXISTS "address_user_id_fkey";

DROP TABLE "address";

/*
schema definition
    ALTER TABLE IF EXISTS "address"
        Modifies the address table only if it exists (prevents errors if the table doesn’t exist).
    DROP CONSTRAINT IF EXISTS "address_user_id_fkey"
        Removes the foreign key constraint that links user_id in address to user_id in users.
        Prevents errors if the constraint doesn’t exist.
        This step is necessary before dropping the table to avoid dependency issues.
    DROP TABLE "address";
        All its rows (data).
        All associated indexes (e.g., city, post_code, country).
        The primary key constraint (id).



*/