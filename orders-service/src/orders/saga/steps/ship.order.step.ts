import { DataSource } from "typeorm";
import { SagaStepInterface } from "./saga.step.interface";
import { STEP } from "src/db/entities/types";

export class ShipOrderStep implements SagaStepInterface<null, null> {

	public step: STEP = STEP.SHIP_ORDER

	constructor(private datasource: DataSource) {}

    invoke(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    compenstate(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
