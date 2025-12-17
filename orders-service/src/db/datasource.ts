import { DataSource } from "typeorm";
import 'dotenv/config'
import { Inbox } from "./entities/inbox.entity";
import { Outbox } from "./entities/reserve-inventory-outbox-message.entity";
import { Snapshot } from "./entities/snapshot.entity";
import { Order } from "./entities/order.entity";
import { Init1765931981956 } from "./migrations/1765931981956-init";

export const datasource = new DataSource({
	type: 'postgres',
	host: "localhost",
	port: Number(process.env.PG_PORT),
	username: process.env.PG_USERNAME,
	password: process.env.PG_PASSWORD,
	database: process.env.PG_DATABASE,
	entities: [Inbox, Order,Outbox, Snapshot],
	migrations: [Init1765931981956]
})
