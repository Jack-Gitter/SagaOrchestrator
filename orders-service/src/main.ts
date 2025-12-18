import 'dotenv/config'
import "reflect-metadata"
import { DataSource } from "typeorm";
import { Order } from "./db/entities/order.entity";
import { InboxMessage } from "./db/entities/inbox.entity";
import { OutboxMessage } from "./db/entities/outbox.entity";
import { Server } from './server/server';

const main = async () => {
	const datasource = new DataSource({
		type: 'postgres',
		host: "localhost",
		port: Number(process.env.PG_PORT),
		username: process.env.PG_USERNAME,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_DATABASE,
		entities: [InboxMessage, OutboxMessage, Order]
	})
	await datasource.initialize()

	const server = new Server(Number(process.env.APP_PORT))

	server.init()
}

main()
