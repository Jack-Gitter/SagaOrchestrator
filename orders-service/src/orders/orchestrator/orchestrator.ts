import { randomUUID, UUID } from "node:crypto";
import { InventoryService } from "src/inventory/inventory.service";
import { OrdersService } from "src/orders/orders.service";
import { DataSource } from "typeorm";
import {setup, Actor, createActor, fromPromise, AnyActorLogic } from "xstate";

export class OrderSagaOrchestrator {
	
	private sagas = new Map<UUID, Actor<AnyActorLogic>>();

	constructor(private ordersService: OrdersService, private inventoryService: InventoryService) {}

	initializeOrderAction(orderId: UUID, productId: number, quantity: number) {

		const orderMachineSetup = setup({
		  types: {
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
						input: ({ context: { orderId, productId, quantity } }) => ({ orderId, productId, quantity }),
					},
				},
				handleInventoryReservationMessage: {
					invoke: {
						src: 'handleInventoryReservationMessageActor',
						input: ({ context: { orderId, productId, quantity } }) => ({ orderId, productId, quantity }),
					},
				}
			},
		});

		const actor = createActor(orderMachine);
		this.sagas.set(orderId, actor)
		actor.start()

	}

	public inventoryResponseListener() {
		const orderId = randomUUID()
		const actor = this.sagas.get(orderId)
		actor.send({type: ''})
	}

	private handleOrderRequestActor = async ({input}: {input: {orderId: UUID, productId: number, quantity: number}}) =>  {
		console.log('Handling Order Request')
		const saga = this.sagas.get(input.orderId)
		await this.ordersService.handleOrderRequest(input.orderId, input.productId, input.quantity, saga.getPersistedSnapshot())
	}

	private handleInventoryReservationMessageActor = async ({input}: {input: {orderId: UUID, productId: number, quantity: number}}) =>  {
		console.log('Handling Inventory Reservation Message')
		await this.inventoryService.handleInventoryResponse(input.orderId, input.productId, input.quantity)
	}

}
