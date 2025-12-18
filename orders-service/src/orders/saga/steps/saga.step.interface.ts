import { STEP } from "src/db/entities/types"

export interface SagaStepInterface<T, U> {

	step: STEP

	invoke(data: T): Promise<void>

	compenstate(data: U): Promise<void>

}
