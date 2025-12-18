import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1766073775688 implements MigrationInterface {
    name = 'Init1766073775688'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."snapshots_state_enum" AS ENUM('create_order', 'wait_for_inventory_response', 'handle_inventory_response', 'wait_for_shipping_response', 'handle_shipping_response', 'error', 'complete')`);
        await queryRunner.query(`CREATE TABLE "snapshots" ("orderId" uuid NOT NULL, "snapshot" jsonb NOT NULL, "state" "public"."snapshots_state_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5aa00ddf013b36d4f7cb19076de" PRIMARY KEY ("orderId"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'canceled', 'fulfilled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("orderId" uuid NOT NULL, "quantity" integer NOT NULL, "productId" integer NOT NULL, "status" "public"."orders_status_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_41ba27842ac1a2c24817ca59eaa" PRIMARY KEY ("orderId"))`);
        await queryRunner.query(`CREATE TYPE "public"."inbox_messagetype_enum" AS ENUM('createPendingOrder', 'inventoryRemoveResponse')`);
        await queryRunner.query(`CREATE TABLE "inbox" ("id" uuid NOT NULL, "orderId" uuid NOT NULL, "messageType" "public"."inbox_messagetype_enum" NOT NULL, "success" boolean NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ab7abc299fab4bb4f965549c819" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."outbox_messagetype_enum" AS ENUM('removeInventory', 'shipProduct')`);
        await queryRunner.query(`CREATE TABLE "outbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "productId" integer NOT NULL, "quantity" integer NOT NULL, "messageType" "public"."outbox_messagetype_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_340ab539f309f03bdaa14aa7649" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "outbox"`);
        await queryRunner.query(`DROP TYPE "public"."outbox_messagetype_enum"`);
        await queryRunner.query(`DROP TABLE "inbox"`);
        await queryRunner.query(`DROP TYPE "public"."inbox_messagetype_enum"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "snapshots"`);
        await queryRunner.query(`DROP TYPE "public"."snapshots_state_enum"`);
    }

}
