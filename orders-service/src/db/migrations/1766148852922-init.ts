import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1766148852922 implements MigrationInterface {
    name = 'Init1766148852922'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'canceled', 'fulfilled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("orderId" uuid NOT NULL, "quantity" integer NOT NULL, "productId" integer NOT NULL, "status" "public"."orders_status_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_41ba27842ac1a2c24817ca59eaa" PRIMARY KEY ("orderId"))`);
        await queryRunner.query(`CREATE TYPE "public"."inbox_messagetype_enum" AS ENUM('createPendingOrder', 'inventoryResponse', 'removeInventoryLocal', 'shippingResponse')`);
        await queryRunner.query(`CREATE TABLE "inbox" ("id" uuid NOT NULL, "orderId" uuid NOT NULL, "messageType" "public"."inbox_messagetype_enum" NOT NULL, "success" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ab7abc299fab4bb4f965549c819" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."outbox_messagetype_enum" AS ENUM('removeInventoryLocal', 'removeInventory', 'shipProduct', 'restoreInventory', 'shipProductCancel')`);
        await queryRunner.query(`CREATE TABLE "outbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "productId" integer NOT NULL, "quantity" integer NOT NULL, "messageType" "public"."outbox_messagetype_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_340ab539f309f03bdaa14aa7649" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."saga_lastcompletedstep_enum" AS ENUM('createOrder', 'removeInventory', 'shipOrder', 'finalizeOrder')`);
        await queryRunner.query(`CREATE TABLE "saga" ("orderId" uuid NOT NULL, "productId" integer NOT NULL, "quantity" integer NOT NULL, "lastCompletedStep" "public"."saga_lastcompletedstep_enum" NOT NULL, CONSTRAINT "PK_4b060ebb00478a66dc7c0a9dd51" PRIMARY KEY ("orderId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "saga"`);
        await queryRunner.query(`DROP TYPE "public"."saga_lastcompletedstep_enum"`);
        await queryRunner.query(`DROP TABLE "outbox"`);
        await queryRunner.query(`DROP TYPE "public"."outbox_messagetype_enum"`);
        await queryRunner.query(`DROP TABLE "inbox"`);
        await queryRunner.query(`DROP TYPE "public"."inbox_messagetype_enum"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    }

}
