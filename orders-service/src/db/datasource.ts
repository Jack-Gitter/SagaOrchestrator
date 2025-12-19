import { DataSource } from "typeorm";
import 'dotenv/config'
import { Order } from "./entities/order.entity";
import { InboxMessage } from "./entities/inbox.entity";
import { OutboxMessage } from "./entities/outbox.entity";
import { OrderSagaEntity } from "./entities/saga.entity";
import { Init1766149471070 } from "./migrations/1766149471070-init";

export const datasource = new DataSource({
	type: 'postgres',
	host: "localhost",
	port: Number(process.env.PG_PORT),
	username: process.env.PG_USERNAME,
	password: process.env.PG_PASSWORD,
	database: process.env.PG_DATABASE,
	entities: [InboxMessage, OutboxMessage, Order, OrderSagaEntity],
	migrations: [Init1766149471070]
})
