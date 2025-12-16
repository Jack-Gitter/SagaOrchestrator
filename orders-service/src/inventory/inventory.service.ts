import { UUID } from "crypto";
import { DataSource } from "typeorm";

export class InventoryService {

	constructor(private datasource: DataSource) {}


	public handleInventoryResponse(orderId: UUID, productId: number, quantity: number) {

	}

}
