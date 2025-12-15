import { DataSource } from "typeorm";
import { Actor, createActor, createMachine, StateMachine} from "xstate";

export class OrderSagaOrchestrator {
	
	
	private sagas = new Map<number, Actor<any>>();

	constructor(private datasource: DataSource) {}

	initializeOrderAction(orderId: number, productId: number, quantity: number) {
		const toggleMachine = createMachine({
		  id: 'toggle',
		  initial: 'Inactive',
		  states: {
			Inactive: {
			  on: { toggle: 'Active' },
			},
			Active: {
			  on: { toggle: 'Inactive' },
			},
		  },
		});

		const actor = createActor(toggleMachine);

		actor.subscribe((snapshot) => {
		  console.log('Value:', snapshot.value);
		});

		actor.start(); 

		actor.send({ type: 'toggle' }); 
		actor.send({ type: 'toggle' }); 

		this.sagas.set(orderId, actor)
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
