import * as amqplib from 'amqplib'
import { randomUUID } from 'node:crypto';
import { OrderSagaOrchestrator } from 'src/orders/orchestrator/orchestrator';
import { waitFor } from 'xstate';

export class RabbitMQService {

	constructor(private ordersSagaOrchestrator: OrderSagaOrchestrator) {}

	public async init(queue: string): Promise<amqplib.Channel> {
	  const conn = await amqplib.connect('amqp://localhost');
	  const ch1 = await conn.createChannel();
	  await ch1.assertQueue(queue);
	  return ch1;
	}

	public async inventoryReservedResponseHandler() {
		const orderId = randomUUID()
		const actor = this.ordersSagaOrchestrator.getActor(orderId)
		actor.send({type: 'inventoryReservationMessageReceived', message: {}, messageId: '123'})

	  await waitFor(
		actor, 
		(state) => {
		  return state.matches('handleInventoryReservationMessage') === false;
		},
		{ timeout: 30000 } 
	  );

	  // ack message here
	}

}
