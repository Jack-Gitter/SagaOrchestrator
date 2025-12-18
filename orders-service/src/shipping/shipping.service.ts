import { OrdersService } from "src/orders/orders.service";
import { DataSource } from "typeorm";

export class ShippingService {


	constructor(private datasource: DataSource, private ordersService: OrdersService) {}

	handleShippingMessage() {
		console.log('handling shipping message')
	}



}
