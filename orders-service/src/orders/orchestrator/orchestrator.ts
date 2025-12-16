import { UUID } from "node:crypto";
import { OrdersService } from "src/orders/orders.service";
import {setup, Actor, createActor, fromPromise, } from "xstate";

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
			  removeInventoryAction: this.removeInventoryAction
		  },
		  actors: {
			  createPendingOrderActor: fromPromise(this.createPendingOrderActor)
		  }
		})

		const orderMachine = orderMachineSetup.createMachine({
		  id: orderId.toString(),
		  context: { orderId: orderId, productId: productId, quantity: quantity },
		  initial: 'createPendingOrder',
		  states: {
			createPendingOrder: {
				invoke: {
					src: 'createPendingOrderActor',
					input: ({ context: { orderId, productId, quantity } }) => ({ orderId, productId, quantity }),
					onDone: {
					  target: 'removeInventory',
					},
					onError: {
					  target: 'error',
					},
				},
			},
			removeInventory: {
				on: { 
				  success: {
					  actions: [{type: 'removeInventoryAction', params: {orderId, productId, quantity}}]
				  }, 
				  failure: 'createPendingOrderRollback'
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

	private async createPendingOrderActor({input}: {input: {orderId: UUID, productId: number, quantity: number}}) {
		const saga = this.sagas.get(input.orderId)
		await this.ordersService.receiveOrder(input.orderId, input.productId, input.quantity, saga.getPersistedSnapshot())
	}
	private async createPendingOrderRollbackAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private removeInventoryAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}
	private removeInventoryActionRollback(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private shipOrderAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}
	private shipOrderRollbackAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private confirmOrderAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}


}
