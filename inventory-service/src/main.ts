import 'reflect-metadata'
import 'dotenv/config'
import { InboxMessage } from './db/entities/inbox.entity'
import { OutboxMessage } from './db/entities/outbox.entity'
import { DataSource } from 'typeorm'
import { RabbitMQService } from './rabbitmq/rabbitmq.service'
import { InventoryService } from './inventory/inventory.service'

const main = async () => {

	const datasource = new DataSource({
		type: 'postgres',
		host: "localhost",
		port: Number(process.env.PG_PORT),
		username: process.env.PG_USERNAME,
		password: process.env.PG_PASSWORD,
		database: process.env.PG_DATABASE,
		entities: [InboxMessage, OutboxMessage]
	})
	await datasource.initialize()

	const inventoryService = new InventoryService(datasource)
	const rabbitMQService = new RabbitMQService(datasource, inventoryService)

	await rabbitMQService.init()


}

main()
