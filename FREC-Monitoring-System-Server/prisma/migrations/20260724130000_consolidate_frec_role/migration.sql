-- FREC is the single canonical review role. Move legacy FREC accounts to it,
-- rename the former Reviewer role, then remove the duplicate role record.
UPDATE "USER_ACCOUNT" SET "role_id" = 5 WHERE "role_id" = 7;
UPDATE "ROLE" SET "label" = 'FREC' WHERE "id" = 5;
DELETE FROM "ROLE" WHERE "id" = 7;
