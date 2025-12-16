import { DataSource } from "typeorm";
import { OrderSagaOrchestrator } from "./orders/orchestrator/orchestrator"
import 'dotenv/config'
import "reflect-metadata"
import { randomUUID } from "node:crypto";

const main = async () => {

	const datasource = new DataSource({
		type: 'postgres',
		host: "localhost",
		port: Number(process.env.PG_PORT),
		username: process.env.PG_USERNAME,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_DATABASE,
	})

	const saga = new OrderSagaOrchestrator(datasource);

	saga.initializeOrderAction(randomUUID(), 2, 3)

}

main()
