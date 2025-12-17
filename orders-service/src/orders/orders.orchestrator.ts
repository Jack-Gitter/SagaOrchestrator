import { randomUUID, UUID } from "node:crypto";
import { Actor, AnyActorLogic, createActor, fromPromise, setup } from "xstate";

export class OrdersSagaOrchestrator {

	private actors = new Map<UUID, Actor<AnyActorLogic>>();

	constructor() {}

	createPendingOrder(productId: number, quantity: number) {
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
				events: {} as {type: ''}
			},
			actors: {
				createOrder: fromPromise(async () => {
					console.log('sup')
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
						src: 'createOrder'
					}
				}
			}
		})
		return machine;
	}


	handleInventoryResponseMessage() {}

	handleShippingResponseMessage() {}
}
