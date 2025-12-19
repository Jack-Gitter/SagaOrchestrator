import 'reflect-metadata'
import 'dotenv/config'
import { InboxMessage } from './db/entities/inbox.entity'
import { OutboxMessage } from './db/entities/outbox.entity'
import { DataSource } from 'typeorm'
import { ShippingService } from './shipping/shipping.service'
import { RabbitMQService } from './rabbitmq/rabbtmq.service'

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

	const shippingService = new ShippingService(datasource)
	const rabbitMQService = new RabbitMQService(datasource, shippingService)

	await rabbitMQService.init()


}

main()
