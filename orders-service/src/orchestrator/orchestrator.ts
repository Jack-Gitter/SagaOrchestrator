import { UUID } from "node:crypto";
import { Inbox } from "src/db/entities/inbox.entity";
import { Order } from "src/db/entities/order.entity";
import { ReserveInventoryOutboxMessage } from "src/db/entities/reserve-inventory-outbox-message.entity";
import { Snapshot } from "src/db/entities/snapshot.entity";
import { MESSAGE_TYPE } from "src/db/types";
import { DataSource } from "typeorm";
import {setup, Actor, createActor, StateMachine, createMachine } from "xstate";

export class OrderSagaOrchestrator {
	
	private sagas = new Map<UUID, Actor<any>>();

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


	private async orderRecievedAction(_, params: {orderId: UUID, productId: number, quantity: number}) {
		console.log("entering the order received action")
		const saga = this.sagas.get(params.orderId)
		await this.datasource.transaction(async (transaction) => {
			try {
				const inboxRepository = transaction.getRepository(Inbox)
				if (await inboxRepository.findOneBy({orderId: params.orderId})) {
					saga.send({type: 'success'})
					
				}
				const orderRepository = transaction.getRepository(Order)
				const inventoryReserveRepository = transaction.getRepository(ReserveInventoryOutboxMessage)
				const snapshotRepository = transaction.getRepository(Snapshot)

				const order = new Order(params.orderId, params.quantity, params.productId)
				const inventoryReserveMessage = new ReserveInventoryOutboxMessage(params.orderId, params.quantity, params.productId)
				const inboxMessage = new Inbox(params.orderId, MESSAGE_TYPE.RECEIVE_ORDER);
				const snapshot = saga.getPersistedSnapshot()
				const snapshotEntity = new Snapshot(params.orderId, snapshot)

				await orderRepository.save(order)
				await inventoryReserveRepository.save(inventoryReserveMessage)
				await snapshotRepository.save(snapshotEntity)
				await inboxRepository.save(inboxMessage)
			} catch (err) {
				saga.send({type: 'failure'})
			}
		})
		saga.send({type: 'success'})
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
