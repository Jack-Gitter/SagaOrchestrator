import { DataSource } from "typeorm";
import {setup, Actor, createActor, assign } from "xstate";

export class OrderSagaOrchestrator {
	
	
	private sagas = new Map<number, Actor<any>>();

	constructor(private datasource: DataSource) {}

	initializeOrderAction(orderId: number, productId: number, quantity: number) {

		const orderMachineSetup = setup({
		  types: {
			events: {} as { type: 'success' } | { type: 'failure' },
			context: {} as { orderId: number, productId: number, quantity: number},
		  },
		  actions: { 
			  orderRecievedAction: this.orderRecievedAction,
			  reserveInventoryAction: this.reserveInventoryAction,
			  shipOrderAction: this.shipOrderAction,
			  shipOrderRollbackAction: this.shipOrderRollbackAction,
			  reserveInventoryRollbackAction: this.reserveInventoryRollbackAction,
			  orderRecievedRollbackAction: this.orderRecievedRollbackAction,
			  removeInventoryAction: this.removeInventoryAction,
			  confirmOrderAction: this.confirmOrderAction,
			  removeInventoryActionRollback: this.removeInventoryActionRollback
		  },
		})

		const orderMachine = orderMachineSetup.createMachine({
		  id: orderId.toString(),
		  context: {orderId: orderId, productId: productId, quantity: quantity},
		  initial: 'orderReceived',
		  states: {
			orderReceived: {
			  entry: {
			    type: 'orderRecievedAction',
				params: ({context}) => ({
					orderId: context.orderId,
					productId: context.productId,
					quantity: context.quantity,
				})
			  },
			  on: { 
				success: 'reserveInventory', 
				failure: 'error', 
			  },
			},
			reserveInventory: {
			  entry: {
			    type: 'reserveInventoryAction',
				params: ({context}) => ({
					orderId: context.orderId,
					productId: context.productId,
					quantity: context.quantity,
				})
			  },
			  on: { 
				success:'shipOrder', 
				failure: 'orderReceivedRollback', 
			  },
			},
			shipOrder: {
			  entry: {
			    type: 'shipOrderAction',
				params: ({context}) => ({
					orderId: context.orderId,
					productId: context.productId,
					quantity: context.quantity,
				})
			  },
			  on: { 
				success: 'removeInventory', 
				failure: 'inventoryReserveRollback', 
			  },
			},
			removeInventory: {
			  entry: {
			    type: 'removeInventoryAction',
				params: ({context}) => ({
					orderId: context.orderId,
					productId: context.productId,
					quantity: context.quantity,
				})
			  },
			  on: { 
				success: 'confirmOrder', 
				failure: 'shipOrderRollback', 
			  },
			},
			removeInventoryActionRollback: {
			  entry: {
			    type: 'removeInventoryActionRollback',
				params: ({context}) => ({
					orderId: context.orderId,
					productId: context.productId,
					quantity: context.quantity,
				})
			  },
			  on: { 
				success: 'reserveInventoryRollbackAction', 
				failure: 'error', 
			  },
			},
			confirmOrder: {
			  entry: {
			    type: 'confirmOrderAction',
				params: ({context}) => ({
					orderId: context.orderId,
					productId: context.productId,
					quantity: context.quantity,
				})
			  },
			  on: { 
				success: 'final', 
				failure: 'removeInventoryActionRollback', 
			  },
			},
			shipOrderRollback: {
			  entry: {
				type: 'shipOrderRollbackAction',
				params: ({context}) => ({
					orderId: context.orderId,
					productId: context.productId,
					quantity: context.quantity,
				})
			  },
			  on: { 
				success: 'reserveInventoryRollback', 
				failure: 'error', 
			  },
			},
			reserveInventoryRollback: {
			  entry: {
				type: 'reserveInventoryRollbackAction',
				params: ({context}) => ({
					orderId: context.orderId,
					productId: context.productId,
					quantity: context.quantity,
				})
			  },
			  on: { 
				success: 'final', 
				failure: 'error', 
			  },
			},
			orderReceivedRollback: {
			  entry: {
			    type: 'orderRecievedRollbackAction',
				params: ({context}) => ({
					orderId: context.orderId,
					productId: context.productId,
					quantity: context.quantity,
				})
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

	private orderRecievedAction(_, params: {orderId: number}) {
		console.log("entering the order received action")
		// create an order object and save to the database
		// create outbox message in the outbox table
		// persist state of state machine
		// transition reserveInventoryState
	}

	private reserveInventoryAction(_, params: {orderId: number}) {
		console.log("entering the reserve inventory action")
		// take the outbox message from the outbox table that corresponds with 
		// the orderId
		// send the message
	}

	private shipOrderAction(_, params: {orderId: number}) {}

	private removeInventoryAction(_, params: {orderId: number}) {}

	private removeInventoryActionRollback(_, params: {orderId: number}) {}

	private reserveInventoryRollbackAction(_, params: {orderId: number}) {}

	private orderRecievedRollbackAction(_, params: {orderId: number}) {}

	private shipOrderRollbackAction(_, params: {orderId: number}) {}

	private confirmOrderAction(_, params: {orderId: number}) {}


}
