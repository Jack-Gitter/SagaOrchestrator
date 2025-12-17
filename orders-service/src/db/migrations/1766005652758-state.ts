import { MigrationInterface, QueryRunner } from "typeorm";

export class State1766005652758 implements MigrationInterface {
    name = 'State1766005652758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."snapshots_state_enum" AS ENUM('create_order', 'wait_for_inventory_response', 'handle_inventory_response', 'wait_for_shipping_response', 'handle_shipping_response')`);
        await queryRunner.query(`ALTER TABLE "snapshots" ADD "state" "public"."snapshots_state_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "snapshots" DROP COLUMN "state"`);
        await queryRunner.query(`DROP TYPE "public"."snapshots_state_enum"`);
    }

}
