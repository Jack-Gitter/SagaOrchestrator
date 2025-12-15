import { UUID } from "node:crypto";
import { Column, Entity } from "typeorm";

@Entity('reserve_inventory_outbox_message')
export class ReserveInventoryOutboxMessage {
	@Column('uuid')
	orderId: UUID

	@Column('int')
	quantity: number

	@Column('int')
	productId: number

	constructor(orderId: UUID, quantity: number, productId: number) {
		this.orderId = orderId
		this.quantity = quantity
		this.productId = productId
	}
}
