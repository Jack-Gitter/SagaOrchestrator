import { randomUUID, UUID } from "node:crypto";
import { OrderSaga } from "./orders.saga";
import { OrderSagaFactory } from "./orders.saga.factory";
import { DataSource } from "typeorm";

export class OrderSagaOrchestrator {

	private sagas = new Map<UUID, OrderSaga>();

	constructor(private orderSagaFactory: OrderSagaFactory, private datasource: DataSource) {}

	newSaga(productId: number, quantity: number) {
		const orderId =randomUUID()
		const saga = this.orderSagaFactory.createSaga(orderId, productId, quantity)
		this.sagas.set(orderId, saga)
	}

	async invokeNext(orderId: UUID) {
		const saga = this.sagas.get(orderId)
		await saga.invokeNext()
	}

	async compensateSaga(orderId: UUID) {
		const saga = this.sagas.get(orderId)
		await saga.compensate()
	}

	handleMessage(message: any) {
		// extract the orderId
		// look up the saga
		// figure out whether the message was successful
		// either invokeNext or rollbackSaga
	}

	restoreFromDb() {}
}
