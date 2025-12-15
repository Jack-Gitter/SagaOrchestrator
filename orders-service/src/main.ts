import { DataSource } from "typeorm";
import { OrderSagaOrchestrator } from "./orchestrator/orchestrator"
import 'dotenv/config'
import "reflect-metadata"

const main = async () => {

	const datasource = new DataSource({
		type: 'postgres',
		host: "localhost",
		port: Number(process.env.PORT),
		username: process.env.USERNAME,
		password: process.env.PASSWORD,
		database: process.env.DATABASE,
	})

	const saga = new OrderSagaOrchestrator(datasource);

	saga.initializeOrderAction(1, 2, 3)

}

main()
