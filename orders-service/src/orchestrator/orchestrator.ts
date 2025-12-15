import { DataSource } from "typeorm";
import { Actor, createActor, createMachine, StateMachine} from "xstate";

export class OrderSagaOrchestrator {
	
	
	private sagas = new Map<number, Actor<any>>();

	constructor(private datasource: DataSource) {}

	initializeOrderAction(orderId: number, productId: number, quantity: number) {
		const toggleMachine = createMachine({
		  id: orderId.toString(),
		  initial: 'orderReceived',
		  states: {
			orderReceived: {
			  on: { 
				success: 'reserveInventory', 
				failure: 'final', 
			  },
			},
			reserveInventory: {
			  on: { 
				success: 'shipOrder', 
				failure: 'final', 
			  },
			},
			shipOrder: {
			  on: { 
				success: 'final', 
				failure: 'shipOrderRollback', 
			  },
			},
			shipOrderRollback: {
			  on: { 
				success: 'reserveInventoryRollback', 
				failure: 'error', 
			  },
			},
			reserveInventoryRollback: {
			  on: { 
				success: 'final', 
				failure: 'error', 
			  },
			},
			final: {},
			error: {}
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
