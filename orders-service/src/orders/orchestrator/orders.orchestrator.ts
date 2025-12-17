import { randomUUID, UUID } from "node:crypto";
import { Actor, AnyActorLogic, createActor, fromPromise, setup } from "xstate";
import { OrdersService } from "../orders.service";
import { DataSource } from "typeorm";
import { Snapshot } from "../../db/entities/snapshot.entity";

export class OrdersSagaOrchestrator {

	private actors = new Map<UUID, Actor<AnyActorLogic>>();

	constructor(private ordersService: OrdersService, private datasource: DataSource) {}

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
				events: {} as {type: 'receivedInventoryResponse', successful: boolean} | {type: 'receivedShippingResponse', successful: boolean}
	 		},
			actors: {
				createOrder: fromPromise(async ({input}: {input: {orderId: UUID, productId: number, quantity: number}}) => { 
					await this.ordersService.createOrder(input.orderId, input.productId, input.quantity, this.actors.get(input.orderId).getPersistedSnapshot())
				}),
				handleInventoryResponse: fromPromise(async () => {
					console.log('handling inventory response message')
				})
			}
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
						input: ({context}) => ({orderId: context.orderId, productId: context.productId, quantity: context.quantity}),
						onDone: {
							target: 'waitForInventoryResponse'
						},
						onError: {
							target: 'error'
						}
					},
				},
				waitForInventoryResponse: {
					on: {
						receivedInventoryResponse: 'handleInventoryResponse'
					}
				},
				handleInventoryResponse: {
					invoke: {
						src: 'handleInventoryResponse',
						onDone: {
							target: 'waitForShippingResponse'
						},
						onError: {
							target: 'error'
						}
					}
				},
				waitForShippingResponse: {
					on: {
						receivedShippingResponse: 'handleShippingResponse'
					}
				},
				handleShippingResponse: {},
				error: {type: 'final'},
				complete: {type: 'final'},

			},
		})
		return machine;
	}

	public async restoreFromDatabase() {
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
				actor.start()
				console.log(`Restored saga from snapshot for saga with orderId ${orderId}`)
			})
		}
	}

	handleInventoryResponseMessage = async (orderId: UUID, successful: boolean) => {
		const actor = this.actors.get(orderId)
		actor.send({type: 'receivedInventoryResponse', successful })
		await new Promise<void>((resolve) => {
			const subscription = actor.subscribe((snapshot) => {
				if (snapshot.matches('waitForShippingResponse')) {
					subscription.unsubscribe();
					resolve();
				}
			});
		});
	}

	handleShippingResponseMessage() {}
}
