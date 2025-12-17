import { DataSource } from "typeorm";

export class OrdersService {


	constructor(private datasource: DataSource) {}

	// persist inbox, outbox, pending order, and state machine state all at once
	createOrder = async () => {
	}


}
