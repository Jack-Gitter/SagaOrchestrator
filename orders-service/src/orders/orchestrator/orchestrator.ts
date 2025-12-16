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
			  persistState: fromPromise()
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
				initial: 'waitingForResponse',
				states: {
					waitingForResponse: {
						invoke: {
							src: 'persistState'
							input: ({ context: { orderId, productId, quantity } }) => ({ orderId, productId, quantity })
						},
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
				},
				on: {
					SUCCESS: 'complete'
				},
			},
			complete: { type: 'final' },
			error: { type: 'final' }
		  },
		});

		const actor = createActor(orderMachine);
		this.sagas.set(orderId, actor)
		actor.start()

	}

	private persistState = async ({input}: {input: {orderId: UUID, productId: number, quantity: number}}) => {
		const saga = this.sagas.get(input.orderId)
		const snapshot = saga.getPersistedSnapshot()

		const snapshotRepository = this.datasource.getRepository(Snapshot)
		const snapshotEntity = new Snapshot(input.orderId, snapshot)
		await snapshotRepository.save(snapshotEntity)
	}
	private createPendingOrderActor = async ({input}: {input: {orderId: UUID, productId: number, quantity: number}}) =>  {
		console.log('Entering Create Pending Order Step')

		await this.persistState({input})

		await this.ordersService.createPendingOrder(input.orderId, input.productId, input.quantity)
	}

	private handleRemoveInventoryResponse = async ({input}: {input: {orderId: UUID, productId: number, quantity: number}}) => {}
}
