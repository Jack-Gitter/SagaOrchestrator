import { DataSource } from "typeorm";
import 'dotenv/config'
import "reflect-metadata"
import { randomUUID } from "node:crypto";
import { OrderSagaOrchestrator } from "./orders/orchestrator/orchestrator";
import { OrdersService } from "./orders/orders.service";

const main = async () => {

	const datasource = new DataSource({
		type: 'postgres',
		host: "localhost",
		port: Number(process.env.PG_PORT),
		username: process.env.PG_USERNAME,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_DATABASE,
	})

	const ordersService = new OrdersService(datasource);

	const saga = new OrderSagaOrchestrator(ordersService);

	saga.initializeOrderAction(randomUUID(), 2, 3)

}

main()
