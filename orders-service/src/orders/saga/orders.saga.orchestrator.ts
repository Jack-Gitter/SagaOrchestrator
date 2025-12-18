import { randomUUID, UUID } from "node:crypto";
import { OrderSaga } from "./orders.saga";
import { OrderSagaFactory } from "./orders.saga.factory";

export class OrderSagaOrchestrator {

	private sagas = new Map<UUID, OrderSaga>();

	constructor(private orderSagaFactory: OrderSagaFactory) {}

	createNewSaga(productId: number, quantity: number) {
		this.orderSagaFactory.createSaga(randomUUID(), productId, quantity)
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
