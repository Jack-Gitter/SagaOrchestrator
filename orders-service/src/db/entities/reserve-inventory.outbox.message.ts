import { UUID } from "node:crypto";
import { Column, Entity } from "typeorm";

@Entity('reserve_inventory_outbox_message')
export class ReserveInventoryOutboxMessage {
	@Column('uuid')
	orderId: UUID

	@Column('int')
	quantity: number

	constructor(orderId: UUID, quantity: number) {
		this.orderId = orderId
		this.quantity = quantity
	}
}
