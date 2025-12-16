import { randomUUID, UUID } from "node:crypto";
import { OrderSagaOrchestrator } from "src/orders/orchestrator/orchestrator";
import { DataSource } from "typeorm";

export class InventoryService {

	constructor(private datasource: DataSource, private orderSagaOrchesatrator: OrderSagaOrchestrator) {}

	public inventoryResponseListener() {
		const orderId = randomUUID()
		const actor = this.orderSagaOrchesatrator.getActor(orderId)
		
		actor.send({type: ''})
	}

	public handleInventoryResponse(orderId: UUID, productId: number, quantity: number) {

	}

}
