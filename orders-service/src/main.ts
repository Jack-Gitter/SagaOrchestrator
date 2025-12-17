import 'dotenv/config'
import "reflect-metadata"
import { DataSource } from "typeorm";
import { Snapshot } from "./db/entities/snapshot.entity";
import { Order } from "./db/entities/order.entity";
import { InboxMessage } from "./db/entities/inbox.entity";
import { OutboxMessage } from "./db/entities/outbox.entity";
import { Server } from './server/server';
import { OrdersService } from './orders/orders.service';
import { OrdersSagaOrchestrator } from './orders/orchestrator/orders.orchestrator';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';
import { InventoryService } from './inventory/inventory.service';

const main = async () => {
	const datasource = new DataSource({
		type: 'postgres',
		host: "localhost",
		port: Number(process.env.PG_PORT),
		username: process.env.PG_USERNAME,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_DATABASE,
		entities: [InboxMessage, OutboxMessage, Order, Snapshot]
	})
	await datasource.initialize()

	const ordersService = new OrdersService(datasource)

	const inventoryService = new InventoryService(datasource)

	const orchestrator = new OrdersSagaOrchestrator(ordersService, inventoryService, datasource)
	await orchestrator.restoreFromDatabase()

	const rabbitMQService = new RabbitMQService(datasource, orchestrator)
	await rabbitMQService.init()
	rabbitMQService.pollOutbox()

	const server = new Server(Number(process.env.APP_PORT), orchestrator)

	server.init()
}

main()
