import { UUID } from "node:crypto";
import { InventoryService } from "src/inventory/inventory.service";
import { OrdersService } from "src/orders/orders.service";
import {setup, Actor, createActor, fromPromise, AnyActorLogic } from "xstate";

export class OrderSagaOrchestrator {
	
	private sagas = new Map<UUID, Actor<AnyActorLogic>>();

	constructor(private ordersService: OrdersService, private inventoryService: InventoryService,) {}

	initializeOrderAction(orderId: UUID, productId: number, quantity: number) {

		const orderMachineSetup = setup({
		  types: {
			events: {} as { type: 'successfulInventoryReservationMessageReceived', message: any; messageId: string },
			context: {} as { orderId: UUID, productId: number, quantity: number},
		  },
		  actors: {
			  handleOrderRequestActor: fromPromise(this.handleOrderRequestActor),
			  handleInventoryReservationMessageActor: fromPromise(this.handleInventoryReservationMessageActor),
		  }
		})

		const orderMachine = orderMachineSetup.createMachine({
			id: orderId.toString(),
			context: { orderId: orderId, productId: productId, quantity: quantity },
			initial: 'handleOrderRequest',
			states: {
				handleOrderRequest: {
					invoke: {
						src: 'handleOrderRequestActor',
						input: ({ context }) => ({ orderId: context.orderId, productId: context.productId, quantity: context.quantity }),
					},
					on: {
						successfulInventoryReservationMessageReceived: 'handleInventoryReservationMessage'
					}
				},
				handleInventoryReservationMessage: {
					invoke: {
						src: 'handleInventoryReservationMessageActor',
						input: ({context, event}) => (
							{ 
								orderId: context.orderId, 
								productId: context.productId, 
								quantity: context.productId,
								message: event.message,
								messageId: event.messageId,
							}
						),
					},
				}
			},
		});

		const actor = createActor(orderMachine);
		this.sagas.set(orderId, actor)
		actor.start()

	}

	public getActor(orderId: UUID) {
		return this.sagas.get(orderId)
	}

	private handleOrderRequestActor = async ({input}: {input: {orderId: UUID, productId: number, quantity: number}}) =>  {
		console.log('Handling Order Request')
		await this.ordersService.handleOrderRequest(
			input.orderId, 
			input.productId, 
			input.quantity, 
			this.sagas.get(input.orderId).getPersistedSnapshot()
		)
	}

	private handleInventoryReservationMessageActor = async ({input}: {input: {orderId: UUID, productId: number, quantity: number, message: any, messageId: any}}) =>  {
		console.log('Handling Inventory Reservation Message')
		await this.inventoryService.handleInventoryResponse(
			input.orderId, 
			input.productId, 
			input.quantity, 
			input.message, 
			input.messageId, 
			this.sagas.get(input.orderId).getPersistedSnapshot()
		)
	}

}
