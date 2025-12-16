import { DataSource } from "typeorm";
import 'dotenv/config'
import "reflect-metadata"
import { randomUUID } from "node:crypto";
import { OrderSagaOrchestrator } from "./orders/orchestrator/orchestrator";
import { OrdersService } from "./orders/orders.service";
import { InboxMessage } from "./db/entities/inbox.entity";
import { Snapshot } from "./db/entities/snapshot.entity";
import { ReserveInventoryOutboxMessage } from "./db/entities/reserve-inventory-outbox-message.entity";
import { Order } from "./db/entities/order.entity";

const main = async () => {

	const datasource = new DataSource({
		type: 'postgres',
		host: "localhost",
		port: Number(process.env.PG_PORT),
		username: process.env.PG_USERNAME,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_DATABASE,
		entities: [InboxMessage, Order, Snapshot, ReserveInventoryOutboxMessage]
	})

	await datasource.initialize()
	console.log('database connected')

	const ordersService = new OrdersService(datasource);

	const saga = new OrderSagaOrchestrator(ordersService, datasource);

	saga.initializeOrderAction(randomUUID(), 2, 3)


}

main()
