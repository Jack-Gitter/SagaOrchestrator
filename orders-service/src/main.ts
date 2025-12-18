import 'dotenv/config'
import "reflect-metadata"
import { DataSource } from "typeorm";
import { Order } from "./db/entities/order.entity";
import { InboxMessage } from "./db/entities/inbox.entity";
import { OutboxMessage } from "./db/entities/outbox.entity";
import { Server } from './server/server';
import { OrderSagaOrchestrator } from './orders/saga/orders.saga.orchestrator';
import { OrderSagaFactory } from './orders/saga/orders.saga.factory';
import { OrderSagaEntity } from './db/entities/saga.entity';
import { RabbitMQService } from './rabbitmq/rabbitmq.service';

const main = async () => {
	const datasource = new DataSource({
		type: 'postgres',
		host: "localhost",
		port: Number(process.env.PG_PORT),
		username: process.env.PG_USERNAME,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_DATABASE,
		entities: [InboxMessage, OutboxMessage, Order, OrderSagaEntity]
	})
	await datasource.initialize()

	const rabbitMQService = new RabbitMQService(datasource)
	await rabbitMQService.init()

	const orderSagaFactory = new OrderSagaFactory(datasource)
	const orderSagaOrchestrator = new OrderSagaOrchestrator(orderSagaFactory, datasource)
	await orderSagaOrchestrator.restoreFromDb()
	const server = new Server(Number(process.env.APP_PORT), orderSagaOrchestrator)

	server.init()
}

main()
