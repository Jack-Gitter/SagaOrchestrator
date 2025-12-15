import { UUID } from "node:crypto";
import { Order } from "src/db/entities/order.entity";
import { ReserveInventoryOutboxMessage } from "src/db/entities/reserve-inventory.outbox.message";
import { DataSource } from "typeorm";
import {setup, Actor, createActor, StateMachine, createMachine } from "xstate";

export class OrderSagaOrchestrator {
	
	private sagas = new Map<UUID, Actor<any>>();
	private machines = new Map<UUID, StateMachine<any, any, any, any, any, any, any, any, any, any, any, any, any, any>>();

	constructor(private datasource: DataSource) {}

	initializeOrderAction(orderId: UUID, productId: number, quantity: number) {

		const orderMachineSetup = setup({
		  types: {
			events: {} as { type: 'success' } | { type: 'failure' },
			context: {} as { orderId: UUID, productId: number, quantity: number},
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
		this.machines.set(orderId, orderMachine)

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


	private async orderRecievedAction(_, params: {orderId: UUID, productId: number, quantity: number}) {
		console.log("entering the order received action")
		// we need to make sure that we are persisting the NEXT state of the saga, because otherwise we have a problem if we fail to transition
		await this.datasource.transaction(async (transaction) => {
			const saga = this.sagas.get(params.orderId)
			try {
				const orderRepository = transaction.getRepository(Order)
				const inventoryReserveRepository = transaction.getRepository(ReserveInventoryOutboxMessage)

				const order = new Order(params.orderId, params.quantity, params.productId)
				const inventoryReserveMessage = new ReserveInventoryOutboxMessage(params.orderId, params.quantity, params.productId)

				// this needs to be the next state
				const snapshot = saga.getSnapshot()

				const machine = this.machines.get(params.orderId)

				await orderRepository.save(order)
				await inventoryReserveRepository.save(inventoryReserveMessage)
				// save snapshot
				saga.send({type: 'success'})
			} catch (err) {

				

			}

			// persist everything


		})
		// all in a transaction
		// create an order object 
		// create outbox message 
		// transition state
		// persist order object, outbox message, and state all in a transaction
	}

	private reserveInventoryAction(_, params: {orderId: UUID, productId: number, quantity: number}) {
		console.log("entering the reserve inventory action")
		// poll for outbox message
		// send outbox message
		// in a transaction
		// remove message 
		// transition state machine 
		// persist both removal and state machine state to the database
	}

	private shipOrderAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private removeInventoryAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private removeInventoryActionRollback(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private reserveInventoryRollbackAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private orderRecievedRollbackAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private shipOrderRollbackAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private confirmOrderAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}


}
