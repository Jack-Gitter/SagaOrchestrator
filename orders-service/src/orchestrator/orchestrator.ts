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
			  reserveInventoryAction: this.reserveInventoryAction,
			  shipOrderAction: this.shipOrderAction,
			  shipOrderRollbackAction: this.shipOrderRollbackAction,
			  reserveInventoryRollbackAction: this.reserveInventoryRollbackAction,
			  orderRecievedRollbackAction: this.orderRecievedRollbackAction,
			  removeInventoryAction: this.removeInventoryAction
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
				failure: 'error', 
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
				failure: 'orderReceivedRollback', 
			  },
			},
			shipOrder: {
			  entry: {
			    type: 'shipOrderAction',
			    params: {
				  dataSource: this.datasource,
				  orderId: orderId,
			    }
			  },
			  on: { 
				success: 'removeInventory', 
				failure: 'inventoryReserveRollback', 
			  },
			},
			removeInventory: {
			  entry: {
			    type: 'removeInventoryAction',
			    params: {
				  dataSource: this.datasource,
				  orderId: orderId,
			    }
			  },
			  on: { 
				success: 'final', 
				failure: 'shipOrderRollback', 
			  },
			},
			shipOrderRollback: {
			  entry: {
				type: 'shipOrderRollbackAction',
			    params: {
				  dataSource: this.datasource,
				  orderId: orderId,
			    }
			  },
			  on: { 
				success: 'reserveInventoryRollback', 
				failure: 'error', 
			  },
			},
			reserveInventoryRollback: {
			  entry: {
				type: 'reserveInventoryRollbackAction',
			    params: {
				  dataSource: this.datasource,
				  orderId: orderId,
			    }
			  },
			  on: { 
				success: 'final', 
				failure: 'error', 
			  },
			},
			orderReceivedRollback: {
			  entry: {
			    type: 'orderRecievedRollbackAction',
				  params: {
					dataSource: this.datasource,
					orderId: orderId,
				  }	
			  },
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

	private shipOrderAction(_, params: {dataSource: DataSource, orderId: number}) {}

	private removeInventoryAction(_, params: {dataSource: DataSource, orderId: number}) {}

	private reserveInventoryRollbackAction(_, params: {dataSource: DataSource, orderId: number}) {}

	private orderRecievedRollbackAction(_, params: {dataSource: DataSource, orderId: number}) {}

	private shipOrderRollbackAction(_, params: {dataSource: DataSource, orderId: number}) {}


}
