import { SagaStepInterface } from "./steps/saga.step.interface";

export class OrderSaga {

	public steps: SagaStepInterface[]
	public completed: SagaStepInterface[]

	constructor() {}


}
