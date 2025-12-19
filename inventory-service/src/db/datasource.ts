import { DataSource } from "typeorm";
import { InboxMessage } from "./entities/inbox.entity";
import { OutboxMessage } from "./entities/outbox.entity";
import 'dotenv/config'
import { Init1766158412713 } from "./migrations/1766158412713-init";

export const datasource = new DataSource({
	type: 'postgres',
	host: "localhost",
	port: Number(process.env.PG_PORT),
	username: process.env.PG_USERNAME,
	password: process.env.PG_PASSWORD,
	database: process.env.PG_DATABASE,
	entities: [InboxMessage, OutboxMessage],
	migrations: [Init1766158412713]
})
