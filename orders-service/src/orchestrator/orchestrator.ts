import { Actor, createActor, createMachine, StateMachine} from "xstate";

export class OrderSagaOrchestrator {
	
	
	private sagas = new Map<number, Actor<any>>();

	constructor() {}


	initializeOrderSaga(orderId: number, productId: number, quantity: number, ) {

	}

	private persistOrderStateAction() {}

	private reserveInventoryAction() {}

	private initiateShippingAction() {}

	private removeInventoryAction() {}
}
