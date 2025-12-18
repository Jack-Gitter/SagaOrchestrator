import { DataSource } from "typeorm";
import { SagaStepInterface } from "./saga.step.interface";
import { STEP } from "../../../db/entities/types";

export class RemoveInventoryStep implements SagaStepInterface<null, null> {

	public step: STEP = STEP.REMOVE_INVENTORY

	constructor(private datasource: DataSource) {}

    invoke(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    compenstate(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
