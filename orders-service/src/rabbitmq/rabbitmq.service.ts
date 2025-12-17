import * as amqplib from 'amqplib'
import { randomUUID } from 'node:crypto';
import { Inbox } from '../db/entities/inbox.entity';
import { OrderSagaOrchestrator } from '../orders/orchestrator/orchestrator';
import { DataSource } from 'typeorm';
import { waitFor } from 'xstate';

export class RabbitMQService {

	constructor(private ordersSagaOrchestrator: OrderSagaOrchestrator, private datasource: DataSource) {}

	public async init(queue: string): Promise<amqplib.Channel> {
	  const conn = await amqplib.connect('amqp://localhost');
	  const ch1 = await conn.createChannel();
	  await ch1.assertQueue(queue);
	  return ch1;
	}

	public async inventoryReservedResponseHandler() {

		const orderId = randomUUID()

		const inboxRepository = this.datasource.getRepository(Inbox)
		if (await inboxRepository.findOneBy({orderId})) {
			// just ack the message and return, we've already seen it and processed it
		}

		const actor = this.ordersSagaOrchestrator.getActor(orderId)
		actor.send({type: 'inventoryReservationMessageReceived', message: {}, messageId: '123'})

	  await waitFor(
		actor, 
		(state) => {
		  return state.matches('handleInventoryReservationMessage') === false;
		},
		{ timeout: 30000 } 
	  );

	  // ack message here, or if we timed out then dont?
	}

}
