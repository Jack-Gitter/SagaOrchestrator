import { SagaStepInterface } from "./steps/saga.step.interface";

export class OrderSaga {

	public steps: SagaStepInterface<unknown, unknown>[]
	public completed: SagaStepInterface<unknown, unknown>[]

	constructor() {}



}
