import { DataSource } from "typeorm"
import { OrderSagaBuilder } from "./orders.saga.builder"
import { CreateOrderStep } from "./steps/create.order.step"
import { RemoveInventoryStep } from "./steps/remove.inventory.step"
import { ShipOrderStep } from "./steps/ship.order.step"
import { FinalizeOrderStep } from "./steps/finalize.order.step"
import { UUID } from "node:crypto"
import { STEP } from "src/db/entities/types"

export class OrderSagaFactory {

	constructor(private datasource: DataSource) {}

	createSaga(orderId: UUID, productId: number, quantity: number, lastCompletedStep?: STEP) {
		const builder = new OrderSagaBuilder(orderId, productId, quantity)

		builder.addStep(new CreateOrderStep(this.datasource))
		.addStep(new RemoveInventoryStep(this.datasource))
		.addStep(new ShipOrderStep(this.datasource))
		.addStep(new FinalizeOrderStep(this.datasource))

		builder.setStep(lastCompletedStep)

		return builder.build()
	}


}
