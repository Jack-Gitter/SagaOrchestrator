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
			  createPendingOrderRollbackAction: this.createPendingOrderRollbackAction,
			  removeInventoryAction: this.removeInventoryAction,
			  removeInventoryActionRollback: this.removeInventoryActionRollback,
			  shipOrderAction: this.shipOrderAction,
			  shipOrderRollbackAction: this.shipOrderRollbackAction,
			  confirmOrderAction: this.confirmOrderAction,
		  },
		})

		const orderMachine = orderMachineSetup.createMachine({
		  id: orderId.toString(),
		  context: { orderId: orderId, productId: productId, quantity: quantity },
		  initial: 'createPendingOrder',
		  states: {
			createPendingOrder: {
				entry: {
					type: 'createPendingOrderAction',
					params: ({context}) => ({
					orderId: context.orderId,
					productId: context.productId,
					quantity: context.quantity,
				  })
				},
				on: { 
				  success: 'removeInventory',
				  failure: 'error'
				},
			},
			createPendingOrderRollback: {
				entry: {
					type: 'createPendingOrderRollbackAction',
					params: ({context}) => ({
					orderId: context.orderId,
					productId: context.productId,
					quantity: context.quantity,
				  })
				},
				on: { 
				  success: 'final',
				  failure: 'error'
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
				  success: 'shipOrder',
				  failure: 'createPendingOrderRollback'
				},
			},
			removeInventoryRollback: {
				entry: {
					type: 'removeInventoryActionRollback',
					params: ({context}) => ({
					orderId: context.orderId,
					productId: context.productId,
					quantity: context.quantity,
				  })
				},
				on: { 
				  success: 'createPendingOrderRollback',
				  failure: 'error'
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
				  success: 'confirmOrder',
				  failure: 'removeInventoryRollback'
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
				  success: 'removeInventoryRollback',
				  failure: 'error'
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
				  failure: 'shipOrderRollback'
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

	private setStep(type: string, successTarget: string, failureTarget: string): any {
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
		  success: {target: successTarget},
		  failure: {target: failureTarget},
	    },
	  }
	}


	private async createPendingOrderAction(_, params: {orderId: UUID, productId: number, quantity: number}) {
		const saga = this.sagas.get(params.orderId)
		await this.ordersService.receiveOrder(params.orderId, params.productId, params.quantity, saga.getPersistedSnapshot())
	}

	private async createPendingOrderRollbackAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}


	private shipOrderAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private removeInventoryAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private removeInventoryActionRollback(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private orderRecievedRollbackAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private shipOrderRollbackAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}

	private confirmOrderAction(_, params: {orderId: UUID, productId: number, quantity: number}) {}


}
