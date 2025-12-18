import { randomUUID, UUID } from "node:crypto";
import { OrderSaga } from "./orders.saga";
import { OrderSagaFactory } from "./orders.saga.factory";
import { DataSource } from "typeorm";
import { OrderSagaEntity } from "src/db/entities/saga.entity";

export class OrderSagaOrchestrator {

	private sagas = new Map<UUID, OrderSaga>();

	constructor(private orderSagaFactory: OrderSagaFactory, private datasource: DataSource) {}

	newSaga(productId: number, quantity: number) {
		const orderId = randomUUID()
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

	async restoreFromDb() {
		const sagaRepository = this.datasource.getRepository(OrderSagaEntity)
		const sagaEntities = await sagaRepository.find()
		const sagas = sagaEntities.map(entity => {
			return this.orderSagaFactory.createSaga(
				entity.orderId, 
				entity.productId, 
				entity.quantity,
				entity.lastCompletedStep
			)
		})
		sagas.forEach(saga => {
			this.sagas.set(saga.orderId, saga)
		})
	}
}
