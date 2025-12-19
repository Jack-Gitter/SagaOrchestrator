import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1766158412713 implements MigrationInterface {
    name = 'Init1766158412713'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."inbox_messagetype_enum" AS ENUM('removeInventory', 'restoreInventory')`);
        await queryRunner.query(`CREATE TABLE "inbox" ("id" uuid NOT NULL, "orderId" uuid NOT NULL, "productId" integer NOT NULL, "quantity" integer NOT NULL, "messageType" "public"."inbox_messagetype_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ab7abc299fab4bb4f965549c819" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."outbox_messagetype_enum" AS ENUM('inventoryResponse')`);
        await queryRunner.query(`CREATE TABLE "outbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "messageType" "public"."outbox_messagetype_enum" NOT NULL, "success" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_340ab539f309f03bdaa14aa7649" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "outbox"`);
        await queryRunner.query(`DROP TYPE "public"."outbox_messagetype_enum"`);
        await queryRunner.query(`DROP TABLE "inbox"`);
        await queryRunner.query(`DROP TYPE "public"."inbox_messagetype_enum"`);
    }

}
