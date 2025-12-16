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
			  example: () => {}
		  }
		})

		const orderMachine = orderMachineSetup.createMachine({
		  id: orderId.toString(),
		  context: { orderId: orderId, productId: productId, quantity: quantity },
		  initial: 'createPendingOrder',
		  states: {
			createPendingOrder: {
				on: { // we want to do an invoke here, because we do want to auto transition
				  success: {
					  target: 'removeInventory'
				  },
				  failure: 'error'
				},
			},
			createPendingOrderRollback: {
				on: { 
				  success: 'complete',
				  failure: 'error'
				},
			},
			removeInventory: {
				on: { 
				  success: {actions: [{type: 'example', params: {}}]}, //'shipOrder', // instead of transitioning, call some actions?
				  failure: 'createPendingOrderRollback'
				},
			},
			removeInventoryRollback: {
				on: { 
				  success: 'createPendingOrderRollback',
				  failure: 'error'
				},
			},
			shipOrder: {
				on: { 
				  success: 'confirmOrder',
				  failure: 'removeInventoryRollback'
				},
			},
			shipOrderRollback: {
				on: { 
				  success: 'removeInventoryRollback',
				  failure: 'error'
				},
			},
			confirmOrder: {
				on: { 
				  success: 'complete',
				  failure: 'shipOrderRollback'
				},
			},
			complete: {type: 'final'},
			error: {type: 'final'}
		  },
		});


		const actor = createActor(orderMachine);
		actor.start()
		this.sagas.set(orderId, actor)

	}

	private async createPendingOrderAction(_, params: {orderId: UUID, productId: number, quantity: number}) {
		const saga = this.sagas.get(params.orderId)
		await this.ordersService.receiveOrder(params.orderId, params.productId, params.quantity, saga.getPersistedSnapshot())
	}
	private async createPendingOrderRollbackAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private removeInventoryAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}
	private removeInventoryActionRollback(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private shipOrderAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}
	private shipOrderRollbackAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private confirmOrderAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}


}
