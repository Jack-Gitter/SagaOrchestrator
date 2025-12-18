import { DataSource } from "typeorm"
import { OrderSagaBuilder } from "./orders.saga.builder"
import { CreateOrderStep } from "./steps/create.order.step"
import { RemoveInventoryStep } from "./steps/remove.inventory.step"
import { ShipOrderStep } from "./steps/ship.order.step"
import { FinalizeOrderStep } from "./steps/finalize.order.step"

export class OrderSagaFactory {

	constructor(private datasource: DataSource) {}

	createSaga() {
		const builder = new OrderSagaBuilder

		builder.addStep(new CreateOrderStep(this.datasource))
		.addStep(new RemoveInventoryStep(this.datasource))
		.addStep(new ShipOrderStep(this.datasource))
		.addStep(new FinalizeOrderStep(this.datasource))

		return builder.build()
	}


}
