import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1765932185971 implements MigrationInterface {
    name = 'Init1765932185971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."inbox_messagetype_enum" AS ENUM('createPendingOrder', 'inventoryRemoveResponse')`);
        await queryRunner.query(`CREATE TABLE "inbox" ("orderId" uuid NOT NULL, "messageType" "public"."inbox_messagetype_enum" NOT NULL, "success" boolean NOT NULL, CONSTRAINT "PK_7b0d4f403b0c1132093b1d94349" PRIMARY KEY ("orderId"))`);
        await queryRunner.query(`CREATE TYPE "public"."outbox_messagetype_enum" AS ENUM('reserveInventory')`);
        await queryRunner.query(`CREATE TABLE "outbox" ("orderId" uuid NOT NULL, "quantity" integer NOT NULL, "productId" integer NOT NULL, "messageType" "public"."outbox_messagetype_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9865c62b95a86f6ea8a7df1f46b" PRIMARY KEY ("orderId"))`);
        await queryRunner.query(`CREATE TABLE "snapshots" ("orderId" uuid NOT NULL, "snapshot" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5aa00ddf013b36d4f7cb19076de" PRIMARY KEY ("orderId"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'canceled', 'fulfilled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("orderId" uuid NOT NULL, "quantity" integer NOT NULL, "productId" integer NOT NULL, "status" "public"."orders_status_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_41ba27842ac1a2c24817ca59eaa" PRIMARY KEY ("orderId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "snapshots"`);
        await queryRunner.query(`DROP TABLE "outbox"`);
        await queryRunner.query(`DROP TYPE "public"."outbox_messagetype_enum"`);
        await queryRunner.query(`DROP TABLE "inbox"`);
        await queryRunner.query(`DROP TYPE "public"."inbox_messagetype_enum"`);
    }

}
