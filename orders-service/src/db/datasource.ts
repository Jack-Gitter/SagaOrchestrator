import { DataSource } from "typeorm";
import 'dotenv/config'
import { InboxMessage } from "./entities/inbox.entity";
import { Order } from "./order.entity";
import { ReserveInventoryOutboxMessage } from "./entities/reserve-inventory-outbox-message.entity";
import { Snapshot } from "./entities/snapshot.entity";
import { Init1765846411204 } from "./migrations/1765846411204-init";

export const datasource = new DataSource({
	type: 'postgres',
	host: "localhost",
	port: Number(process.env.PG_PORT),
	username: process.env.PG_USERNAME,
	password: process.env.PG_PASSWORD,
	database: process.env.PG_DATABASE,
	entities: [InboxMessage, Order, ReserveInventoryOutboxMessage, Snapshot],
	migrations: [Init1765846411204]
})
