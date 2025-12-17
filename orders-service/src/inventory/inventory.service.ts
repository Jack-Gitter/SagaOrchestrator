import { DataSource } from "typeorm";

export class InventoryService {

	constructor(private datasource: DataSource) {}

	handleInventoryMessage = async () => {

		await this.datasource.transaction(async manager => {
			// write the inbox message to the database
			// write the outbox message to the database
			// write write the state to the database
		})

	}

}
