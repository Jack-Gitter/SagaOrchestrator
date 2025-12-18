import { UUID } from "node:crypto";
import { OrdersService } from "src/orders/orders.service";
import { DataSource } from "typeorm";

export class ShippingService {


	constructor(private datasource: DataSource, private ordersService: OrdersService) {}

	handleShippingMessage = async (messageId: UUID, orderId: UUID, productId: number, quantity: number, successful: boolean) => {
		if (successful) {
			await this.ordersService.finalizeOrder(messageId, orderId)
		}
	}
}
