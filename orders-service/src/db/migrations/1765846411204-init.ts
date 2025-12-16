import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1765846411204 implements MigrationInterface {
    name = 'Init1765846411204'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."inbox_messagetype_enum" AS ENUM('receive_order')`);
        await queryRunner.query(`CREATE TABLE "inbox" ("orderId" uuid NOT NULL, "messageType" "public"."inbox_messagetype_enum" NOT NULL, CONSTRAINT "PK_7b0d4f403b0c1132093b1d94349" PRIMARY KEY ("orderId"))`);
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('pending', 'canceled', 'fulfilled')`);
        await queryRunner.query(`CREATE TABLE "order" ("orderId" uuid NOT NULL, "quantity" integer NOT NULL, "productId" integer NOT NULL, "status" "public"."order_status_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b075313d4d7e1c12f1a6e6359e8" PRIMARY KEY ("orderId"))`);
        await queryRunner.query(`CREATE TABLE "reserve_inventory_outbox_messages" ("orderId" uuid NOT NULL, "quantity" integer NOT NULL, "productId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cc15550cf8189fddfd06549b285" PRIMARY KEY ("orderId"))`);
        await queryRunner.query(`CREATE TABLE "snapshots" ("orderId" uuid NOT NULL, "snapshot" jsonb NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5aa00ddf013b36d4f7cb19076de" PRIMARY KEY ("orderId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "snapshots"`);
        await queryRunner.query(`DROP TABLE "reserve_inventory_outbox_messages"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
        await queryRunner.query(`DROP TABLE "inbox"`);
        await queryRunner.query(`DROP TYPE "public"."inbox_messagetype_enum"`);
    }

}
