import { UUID } from "node:crypto";
import { OrdersService } from "src/orders/orders.service";
import { DataSource } from "typeorm";

export class ShippingService {


	constructor(private datasource: DataSource, private ordersService: OrdersService) {}

	handleShippingMessage = async (orderId: UUID) => {
		await this.ordersService.finalizeOrder(orderId)
	}
}
