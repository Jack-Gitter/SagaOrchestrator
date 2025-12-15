import { DataSource } from "typeorm";
import {setup, Actor, createActor, assign } from "xstate";

export class OrderSagaOrchestrator {
	
	
	private sagas = new Map<number, Actor<any>>();

	constructor(private datasource: DataSource) {}

	initializeOrderAction(orderId: number, productId: number, quantity: number) {

		const orderMachineSetup = setup({
		  types: {
			events: {} as { type: 'success' } | { type: 'failure' },
		  },
		  actions: { 
			  orderRecievedAction: this.orderRecievedAction,
			  reserveInventoryAction: this.reserveInventoryAction
		  },
		})

		const orderMachine = orderMachineSetup.createMachine({
		  id: orderId.toString(),
		  initial: 'orderReceived',
		  states: {
			orderReceived: {
			  entry: {
			    type: 'orderRecievedAction',
				  params: {
					dataSource: this.datasource,
					orderId: orderId,
				  }	
			  },
			  on: { 
				success: 'reserveInventory', 
				failure: 'final', 
			  },
			},
			reserveInventory: {
			  entry: {
			    type: 'reserveInventoryAction',
				  params: {
					dataSource: this.datasource,
					orderId: orderId,
				  }
			  },
			  on: { 
				success:'shipOrder', 
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
		actor.send({type: 'success'})
		this.sagas.set(orderId, actor)
	}

	private orderRecievedAction(_, params: {dataSource: DataSource, orderId: number}) {
		console.log("entering the order received action")
		// create an order object and save to the database
		// create outbox message in the outbox table
		// persist state of state machine
		// transition reserveInventoryState
	}

	private reserveInventoryAction(_, params: {dataSource: DataSource, orderId: number}) {
		console.log("entering the reserve inventory action")
		// take the outbox message from the outbox table that corresponds with 
		// the orderId
		// send the message
	}

	private initiateShippingAction(orderId: number) {}

	private removeInventoryAction(orderId: number) {}
}
