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
		this.sagas.set(orderId, actor)
		actor.start()

	}

	private createPendingOrderActor = async ({input}: {input: {orderId: UUID, productId: number, quantity: number}}) =>  {
		console.log('Entering Create Pending Order Step')

		const saga = this.sagas.get(input.orderId)
		const snapshot = saga.getPersistedSnapshot()

		const snapshotRepository = this.datasource.getRepository(Snapshot)
		const snapshotEntity = new Snapshot(input.orderId, snapshot)
		await snapshotRepository.save(snapshotEntity)

		await this.ordersService.createPendingOrder(input.orderId, input.productId, input.quantity, saga.getPersistedSnapshot())
	}

	private handleRemoveInventoryResponse = async ({input}: {input: {orderId: UUID, productId: number, quantity: number}}) => {}
}
