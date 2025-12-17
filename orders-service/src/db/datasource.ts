import { DataSource } from "typeorm";
import 'dotenv/config'
import { Snapshot } from "./entities/snapshot.entity";
import { Order } from "./entities/order.entity";
import { InboxMessage } from "./entities/inbox.entity";
import { OutboxMessage } from "./entities/outbox.entity";
import { Init1765996028913 } from "./migrations/1765996028913-init";

export const datasource = new DataSource({
	type: 'postgres',
	host: "localhost",
	port: Number(process.env.PG_PORT),
	username: process.env.PG_USERNAME,
	password: process.env.PG_PASSWORD,
	database: process.env.PG_DATABASE,
	entities: [InboxMessage, OutboxMessage, Order, Snapshot],
	migrations: [Init1765996028913]
})
