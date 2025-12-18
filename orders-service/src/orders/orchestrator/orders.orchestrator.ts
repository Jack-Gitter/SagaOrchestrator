import { randomUUID, UUID } from "node:crypto";
import { Actor, AnyActorLogic, createActor, fromPromise, setup } from "xstate";
import { OrdersService } from "../orders.service";
import { DataSource } from "typeorm";
import { Snapshot } from "../../db/entities/snapshot.entity";
import { InventoryService } from "../../inventory/inventory.service";
import { STATE } from "../../db/types";
import { ShippingService } from "src/shipping/shipping.service";

export class OrdersSagaOrchestrator {

	private actors = new Map<UUID, Actor<AnyActorLogic>>();

	constructor(private ordersService: OrdersService, private inventoryService: InventoryService, private shippingService: ShippingService, private datasource: DataSource) {}

	createOrder(productId: number, quantity: number) {
		this.initializeNewSaga(productId, quantity)
	}

	private initializeNewSaga(productId: number, quantity: number) {
		const orderId = randomUUID()
		const machine = this.initMachine()
		const actor = createActor(machine, {input: {orderId, productId, quantity}})
		this.actors.set(orderId, actor)
		actor.start()
	}

	private initMachine() {
		const machineSetup = setup({
			types: {
				input: {} as {orderId: UUID, productId: number, quantity: number},
				context: {} as {orderId: UUID, productId: number, quantity: number},
				events: {} as {type: 'receivedInventoryResponse', successful: boolean, messageId: UUID} | {type: 'receivedShippingResponse', successful: boolean, messageId: UUID}
	 		},
			actors: {
				createOrder: fromPromise(async ({input}: {input: {orderId: UUID, productId: number, quantity: number}}) => { 
					await this.ordersService.createOrder(
						input.orderId, 
						input.productId, 
						input.quantity, 
						this.actors.get(input.orderId).getPersistedSnapshot()
					)
				}),
				handleInventoryResponse: fromPromise(async ({input}: {input: {messageId: UUID, orderId: UUID, productId: number, successful: boolean, quantity: number}}) => {
					await this.inventoryService.handleInventoryMessage(
						input.messageId,
						input.orderId, 
						input.productId, 
						input.quantity, 
						input.successful, 
						this.actors.get(input.orderId).getPersistedSnapshot()
					)
				}),
				persistState: fromPromise(async ({input}: {input: {orderId: UUID, state: STATE}}) => {
					await this.persisState(input.orderId, input.state)
				}),
				handleShippingResponse: fromPromise(async ({input}: {input: {messageId: UUID, orderId: UUID, productId: number, successful: boolean, quantity: number}}) => {
					await this.shippingService.handleShippingMessage(
						input.messageId, 
						input.orderId, 
						input.productId, 
						input.quantity, 
						input.successful, 
						this.actors.get(input.orderId).getPersistedSnapshot()
					)
				})
			},
		})

		const machine = machineSetup.createMachine({
			context: ({input}) => ({
				orderId: input.orderId,
				productId: input.productId,
				quantity: input.quantity
			}),
			initial: 'createOrder',
			states: {
				createOrder: {
					invoke: {
						src: 'createOrder',
						input: ({context}) => ({
							orderId: context.orderId, 
							productId: context.productId, 
							quantity: context.quantity
						}),
						onDone: {
							target: 'waitForInventoryResponse'
						},
						onError: {
							target: 'error'
						}
					},
				},
				waitForInventoryResponse: {
					invoke: {
						src: 'persistState',
						input: ({context}) => ({
							orderId: context.orderId, 
							state: STATE.WAIT_FOR_INVENTORY_RESPONSE
						}),
					},
					on: {
						receivedInventoryResponse: 'handleInventoryResponse'
					}
				},
				handleInventoryResponse: {
					invoke: {
						src: 'handleInventoryResponse',
						input: ({context, event}) => ({
							messageId: event.messageId,
							orderId: context.orderId, 
							productId: context.productId, 
							quantity: context.quantity,
							successful: event.successful  
						}),
						onDone: {
							target: 'waitForShippingResponse'
						},
						onError: {
							target: 'error'
						}
					}
				},
				waitForShippingResponse: {
					invoke: {
						src: 'persistState',
						input: ({context}) => ({
							orderId: context.orderId, 
							state: STATE.WAIT_FOR_SHIPPING_RESPONSE
						}),
					},
					on: {
						receivedShippingResponse: 'handleShippingResponse'
					}
				},
				handleShippingResponse: {
					invoke: {
						src: 'handleShippingResponse',
						input: ({context, event}) => ({
							messageId: event.messageId,
							orderId: context.orderId, 
							productId: context.productId, 
							quantity: context.quantity,
							successful: event.successful  
						}),
						onDone: {
							target: 'complete'
						}
					}
				},
				error: {
					invoke: {
						src: 'persistState',
						input: ({context}) => ({
							orderId: context.orderId, 
							state: STATE.ERROR
						}),
					},
				},
				complete: {
					invoke: {
						src: 'persistState',
						input: ({context}) => ({
							orderId: context.orderId, 
							state: STATE.COMPLETE
						}),
					},
				},

			},
		})
		return machine;
	}

	public restoreFromDatabase = async () => {
		const snapshotRepository = this.datasource.getRepository(Snapshot)
		const snapshotEntities = await snapshotRepository.find()
		if (snapshotEntities.length > 0) {
			const snapshots = snapshotEntities.map(snapshotEntity => {
				return JSON.stringify(snapshotEntity.snapshot)
			})
			const machine = this.initMachine()
			snapshots.forEach(snapshot => {
				const actor = createActor(machine, {snapshot: JSON.parse(snapshot)})
				const orderId = actor.getSnapshot().context.orderId
				this.actors.set(orderId, actor)
				console.log(`Restored saga from snapshot for saga with orderId ${orderId} in state ${actor.getSnapshot().value}`)
				actor.start()
			})
		}
	}

	private persisState = async (orderId: UUID, state: STATE) => {
		const actor = this.actors.get(orderId)
		const persistedSnapshot = actor.getPersistedSnapshot()
		const snapshotRepository = this.datasource.getRepository(Snapshot)
		const snapshot = new Snapshot(orderId, state, persistedSnapshot)
		await snapshotRepository.save(snapshot)
	}

	public handleInventoryResponseMessage = async (orderId: UUID, successful: boolean, messageId: UUID) => {
		const actor = this.actors.get(orderId)

		const currentSnapshot = actor.getSnapshot()
    
		if (!currentSnapshot) {
			console.log(`Got message with invalid orderId`)
			return
		}

		if (!currentSnapshot.matches('waitForInventoryResponse')) {
			console.log(`Already processed inventory response for orderId ${orderId} (current state: ${currentSnapshot.value})`)
			return;
		}

		actor.send({type: 'receivedInventoryResponse', successful, messageId })

		await new Promise<void>((resolve) => {
			const subscription = actor.subscribe((snapshot) => {
				if (snapshot.matches('waitForShippingResponse')) {
					subscription.unsubscribe();
					resolve();
				}
			});
		});
	}

	handleShippingResponseMessage = async (orderId: UUID, successful: boolean, messageId: UUID) => {
		const actor = this.actors.get(orderId)

		const currentSnapshot = actor?.getSnapshot()

		if (!currentSnapshot) {
			console.log(`Got message with invalid orderId`)
			return
		}
    
		if (!currentSnapshot.matches('waitForShippingResponse')) {
			console.log(`Already processed shipping response for orderId ${orderId} (current state: ${currentSnapshot.value})`)
			return;
		}

		actor.send({type: 'receivedShippingResponse', successful, messageId })

		await new Promise<void>((resolve) => {
			const subscription = actor.subscribe((snapshot) => {
				if (snapshot.matches('waitForShippingResponse')) {
					subscription.unsubscribe();
					resolve();
				}
			});
		});
	}
}
