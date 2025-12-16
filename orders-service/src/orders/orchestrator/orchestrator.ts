import { UUID } from "node:crypto";
import { OrdersService } from "src/orders/orders.service";
import {setup, Actor, createActor, } from "xstate";

export class OrderSagaOrchestrator {
	
	private sagas = new Map<UUID, Actor<any>>();

	constructor(private ordersService: OrdersService) {}

	initializeOrderAction(orderId: UUID, productId: number, quantity: number) {

		const orderMachineSetup = setup({
		  types: {
			events: {} as { type: 'success' } | { type: 'failure' },
			context: {} as { orderId: UUID, productId: number, quantity: number},
		  },
		  actions: { 
			  createPendingOrderAction: this.createPendingOrderAction,
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

		const createPendingOrder = this.setStep('createPendingOrderAction','reserveInventory', 'error')
		const reserveInventory = this.setStep('reserveInventoryAction','shipOrder', 'orderReceivedRollback')
		const shipOrder = this.setStep('shipOrderAction', 'removeInventory', 'inventoryReserveRollback')
		const removeInventory = this.setStep('removeInventoryAction', 'confirmOrder', 'shipOrderRollback')
		const confirmOrder = this.setStep('confirmOrderAction', 'final', 'removeInventoryAction')
		const removeInventoryAction = this.setStep('removeInventoryActionRollback', 'shipOrderRollback', 'error')
		const shipOrderRollback = this.setStep('shipOrderRollbackAction', 'reserveInventoryRollback', 'error')
		const reserveInventoryRollback = this.setStep('reserveInventoryRollbackAction', 'createPendingOrderRollback', 'error')
		const createPendingOrderRollback = this.setStep('createPendingOrderRollbackAction', 'final', 'error')

		const orderMachine = orderMachineSetup.createMachine({
		  id: orderId.toString(),
		  context: { orderId: orderId, productId: productId, quantity: quantity },
		  initial: 'orderReceived',
		  states: {
			createPendingOrder,
			reserveInventory,
			shipOrder,
			removeInventory,
			confirmOrder,
			removeInventoryAction,
			shipOrderRollback,
			reserveInventoryRollback,
			createPendingOrderRollback,
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


	private async createPendingOrderAction(_, params: {orderId: UUID, productId: number, quantity: number}) {
		const saga = this.sagas.get(params.orderId)
		await this.ordersService.receiveOrder(params.orderId, params.productId, params.quantity, saga.getPersistedSnapshot())
	}

	private async createPendingOrderRollbackAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private reserveInventoryAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private shipOrderAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private removeInventoryAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private removeInventoryActionRollback(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private reserveInventoryRollbackAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private orderRecievedRollbackAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private shipOrderRollbackAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private confirmOrderAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}


}
