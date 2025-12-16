import { UUID } from "node:crypto";
import { Snapshot } from "src/db/entities/snapshot.entity";
import { OrdersService } from "src/orders/orders.service";
import { DataSource } from "typeorm";
import {setup, Actor, createActor, fromPromise, raise, AnyActorLogic, } from "xstate";

export class OrderSagaOrchestrator {
	
	private sagas = new Map<UUID, Actor<AnyActorLogic>>();

	constructor(private ordersService: OrdersService, private datasource: DataSource) {}

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

	private persistMachineState = async ({input}: {input: {orderId: UUID, productId: number, quantity: number}}) => {
		const saga = this.sagas.get(input.orderId)
		const snapshot = saga.getPersistedSnapshot()

		const snapshotRepository = this.datasource.getRepository(Snapshot)
		const snapshotEntity = new Snapshot(input.orderId, snapshot)
		await snapshotRepository.save(snapshotEntity)
	}

	private handleOrderRequestActor = async ({input}: {input: {orderId: UUID, productId: number, quantity: number}}) =>  {
		console.log('Handling Order Request')
		await this.persistMachineState({input})
		await this.ordersService.createPendingOrder(input.orderId, input.productId, input.quantity)
	}
	private handleInventoryReservationMessageActor = async ({input}: {input: {orderId: UUID, productId: number, quantity: number}}) =>  {
		console.log('Handling Inventory Reservation Message')
	}

}
