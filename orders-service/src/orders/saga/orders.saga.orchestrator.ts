import { randomUUID, UUID } from "node:crypto";
import { OrderSaga } from "./orders.saga";
import { OrderSagaFactory } from "./orders.saga.factory";

export class OrderSagaOrchestrator {

	private sagas = new Map<UUID, OrderSaga>();

	constructor(private orderSagaFactory: OrderSagaFactory) {}

	newSaga(productId: number, quantity: number) {
		const orderId =randomUUID()
		const saga = this.orderSagaFactory.createSaga(orderId, productId, quantity)
		this.sagas.set(orderId, saga)
	}

	invokeNext(orderId: UUID) {}

	rollbackSaga(orderId: UUID) {}

	handleMessage(message: any) {
		// extract the orderId
		// look up the saga
		// figure out whether the message was successful
		// either invokeNext or rollbackSaga
	}

	restoreFromDb() {}
}
