import { DataSource } from "typeorm";
import { OrderSagaOrchestrator } from "./orchestrator/orchestrator"

const main = async () => {

	const datasource = new DataSource({
		type: "mysql",
		host: "localhost",
		port: 3306,
		username: "test",
		password: "test",
		database: "test",
	})

	const saga = new OrderSagaOrchestrator(datasource);

	saga.initializeOrderAction(1, 2, 3)

}

main()
