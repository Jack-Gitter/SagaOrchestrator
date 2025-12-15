import { DataSource } from "typeorm";
import {setup, Actor, createActor, assign, StateNode } from "xstate";

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

		const orderReceived = this.setStep('orderReceivedAction','reserveInventory', 'error')
		const reserveInventory = this.setStep('reserveInventoryAction','shipOrder', 'orderReceivedRollback')
		const shipOrder = this.setStep('shipOrderAction', 'removeInventory', 'inventoryReserveRollback')
		const removeInventory = this.setStep('removeInventoryAction', 'confirmOrder', 'shipOrderRollback')
		const confirmOrder = this.setStep('confirmOrderAction', 'final', 'removeInventoryAction')
		const removeInventoryAction = this.setStep('removeInventoryActionRollback', 'shipOrderRollback', 'error')
		const shipOrderRollback = this.setStep('shipOrderRollbackAction', 'reserveInventoryRollback', 'error')
		const reserveInventoryRollback = this.setStep('reserveInventoryRollbackAction', 'orderRecievedRollback', 'error')
		const orderReceivedRollback = this.setStep('orderRecievedRollbackAction', 'final', 'error')

		const orderMachine = orderMachineSetup.createMachine({
		  id: orderId.toString(),
		  context: { orderId: orderId, productId: productId, quantity: quantity },
		  initial: 'orderReceived',
		  states: {
			orderReceived,
			reserveInventory,
			shipOrder,
			removeInventory,
			confirmOrder,
			removeInventoryAction,
			shipOrderRollback,
			reserveInventoryRollback,
			orderReceivedRollback,
			final: {},
			error: {}
		  },
		});

		const actor = createActor(orderMachine);
		actor.start()
		actor.send({type: 'success'})
		this.sagas.set(orderId, actor)
	}

	private setStep(type: string, success: string, failure: string): any {
	  return {
	    entry: {
		  type,
		  params: ({context}) => ({
		    orderId: context.orderId,
		    productId: context.productId,
		    quantity: context.quantity,
		  })
	    },
	    on: { 
		  success,
		  failure,
	    },
	  }
	}


	private orderRecievedAction(_, params: {orderId: number, productId: number, quantity: number}) {
		console.log("entering the order received action")
		// create an order object and save to the database
		// create outbox message in the outbox table
		// persist state of state machine
		// transition reserveInventoryState
	}

	private reserveInventoryAction(_, params: {orderId: number, productId: number, quantity: number}) {
		console.log("entering the reserve inventory action")
		// poll for outbox message
		// send outbox message
		// remove message and transition state in a transaction
	}

	private shipOrderAction(_, params: {orderId: number, productId: number, quantity: number}) {}

	private removeInventoryAction(_, params: {orderId: number, productId: number, quantity: number}) {}

	private removeInventoryActionRollback(_, params: {orderId: number, productId: number, quantity: number}) {}

	private reserveInventoryRollbackAction(_, params: {orderId: number, productId: number, quantity: number}) {}

	private orderRecievedRollbackAction(_, params: {orderId: number, productId: number, quantity: number}) {}

	private shipOrderRollbackAction(_, params: {orderId: number, productId: number, quantity: number}) {}

	private confirmOrderAction(_, params: {orderId: number, productId: number, quantity: number}) {}


}
