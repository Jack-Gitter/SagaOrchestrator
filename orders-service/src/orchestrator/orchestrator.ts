import { DataSource } from "typeorm";
import {setup, Actor, createActor } from "xstate";

export class OrderSagaOrchestrator {
	
	
	private sagas = new Map<number, Actor<any>>();

	constructor(private datasource: DataSource) {}

	initializeOrderAction(orderId: number, productId: number, quantity: number) {
		const orderMachine = setup({
		  types: {
			events: {} as { type: 'success' } | { type: 'failure' },
		  },
		}).createMachine({
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

		const actor = createActor(orderMachine);
		actor.start()
		this.sagas.set(orderId, actor)
	}

	private persistOrderStateAction(orderId: number) {
		// update the state of the order in the database 
		// write outbox message to database
		// serialize and write the state of the state machine to the database
	}

	private reserveInventoryAction(orderId: number) {}

	private initiateShippingAction(orderId: number) {}

	private removeInventoryAction(orderId: number) {}
}
