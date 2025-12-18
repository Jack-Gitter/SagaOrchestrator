import { UUID } from "node:crypto";
import { OrderSaga } from "./orders.saga";

export class OrderSagaOrchestrator {

	private sagas = new Map<UUID, OrderSaga>();

	constructor() {}

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
