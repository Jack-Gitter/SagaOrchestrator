import { DataSource } from "typeorm";
import { Actor, createActor, createMachine, StateMachine} from "xstate";

export class OrderSagaOrchestrator {
	
	
	private sagas = new Map<number, Actor<any>>();

	constructor(private datasource: DataSource) {}


	initializeOrderSaga(orderId: number, productId: number, quantity: number, ) {

	}

	private persistOrderStateAction() {

		// update the state of the order in the database 
		// write outbox message to database
		// serialize and write the state of the state machine to the database
	}

	private reserveInventoryAction() {}

	private initiateShippingAction() {}

	private removeInventoryAction() {}
}
