import { DataSource } from "typeorm";
import { SagaStepInterface } from "./saga.step.interface";

export class FinalizeOrderStep implements SagaStepInterface<null, null> {

	constructor(private datasource: DataSource) {}

    run(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    compenstate(): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
