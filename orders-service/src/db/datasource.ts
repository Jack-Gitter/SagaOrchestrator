import { DataSource } from "typeorm";
import 'dotenv/config'
import { InboxMessage } from "./entities/inbox.entity";
import { ReserveInventoryOutboxMessage } from "./entities/reserve-inventory-outbox-message.entity";
import { Snapshot } from "./entities/snapshot.entity";
import { Order } from "./entities/order.entity";
import { Init1765922751544 } from "./migrations/1765922751544-init";

export const datasource = new DataSource({
	type: 'postgres',
	host: "localhost",
	port: Number(process.env.PG_PORT),
	username: process.env.PG_USERNAME,
	password: process.env.PG_PASSWORD,
	database: process.env.PG_DATABASE,
	entities: [InboxMessage, Order,ReserveInventoryOutboxMessage, Snapshot],
	migrations: [Init1765922751544]
})
