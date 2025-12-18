import { DataSource } from "typeorm";
import { SagaStepInterface } from "./saga.step.interface";
import { STEP } from "../../../db/entities/types";

export class FinalizeOrderStep implements SagaStepInterface<null, null> {

	public step: STEP = STEP.FINALIZE_ORDER

	constructor(private datasource: DataSource) {}

    invoke(): Promise<void> {
		this.datasource.transaction(async manager => {

		})
    }
    compenstate(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
