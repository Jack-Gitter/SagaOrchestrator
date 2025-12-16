import { UUID } from "node:crypto";
import { OrdersService } from "src/orders/orders.service";
import {setup, Actor, createActor, fromPromise, raise, AnyActorLogic, } from "xstate";

export class OrderSagaOrchestrator {
	
	private sagas = new Map<UUID, Actor<AnyActorLogic>>();

	constructor(private ordersService: OrdersService) {}

	initializeOrderAction(orderId: UUID, productId: number, quantity: number) {

		const orderMachineSetup = setup({
		  types: {
			events: {} as { type: 'INVENTORY_RESPONSE_ARRIVED' } | { type: 'INVENTORY_REMOVE_SUCCESS' } | { type: 'SUCCESS' },
			context: {} as { orderId: UUID, productId: number, quantity: number},
		  },
		  actors: {
			  createPendingOrderActor: fromPromise(this.createPendingOrderActor),
			  handleRemoveInventoryResponse: fromPromise(this.handleRemoveInventoryResponse),
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
				},
			},
			removeInventory: {
				on: {
					SUCCESS: 'complete'
				},
				initial: 'waitingForResponse',
				states: {
					waitingForResponse: {
						on: {
							INVENTORY_REMOVE_SUCCESS: { target: 'handleInventoryRemoveSuccess' } 
						}
					},
					handleInventoryRemoveSuccess: {
						invoke: {
							src: 'handleRemoveInventoryResponse',
							input: ({ context: { orderId, productId, quantity } }) => ({ orderId, productId, quantity }),
							onDone: {
								actions: raise({type: "INVENTORY_REMOVE_SUCCESS"})
							}
						}
					},
				}
			},
			complete: { type: 'final' },
			error: { type: 'final' }
		  },
		});


		const actor = createActor(orderMachine);
		actor.start()
		this.sagas.set(orderId, actor)

	}

	private async createPendingOrderActor({input}: {input: {orderId: UUID, productId: number, quantity: number}}) {
		const saga = this.sagas.get(input.orderId)
		await this.ordersService.createPendingOrder(input.orderId, input.productId, input.quantity, saga.getPersistedSnapshot())
	}

	private async handleRemoveInventoryResponse({input}: {input: {orderId: UUID, productId: number, quantity: number}}) {}
}
