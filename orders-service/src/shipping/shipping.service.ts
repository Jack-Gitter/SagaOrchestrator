import { UUID } from "node:crypto";
import { OrdersService } from "src/orders/orders.service";
import { DataSource } from "typeorm";
import { Snapshot as SagaSnapshot } from "xstate";

export class ShippingService {


	constructor(private datasource: DataSource, private ordersService: OrdersService) {}

	handleShippingMessage = async (messageId: UUID, orderId: UUID, productId: number, quantity: number, successful: boolean, snapshot: SagaSnapshot<unknown>) => {
		if (successful) {
			await this.ordersService.finalizeOrder(messageId, orderId, snapshot)
		}
	}
}
