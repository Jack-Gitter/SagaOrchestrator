import { UUID } from "node:crypto";
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from "typeorm";

@Entity('reserve_inventory_outbox_messages')
export class ReserveInventoryOutboxMessage {
	@Column('uuid')
	orderId: UUID

	@Column('int')
	quantity: number

	@Column('int')
	productId: number

	@CreateDateColumn()
	createdAt: Date;
	
	@UpdateDateColumn()
	updatedAt: Date;

	constructor(orderId: UUID, quantity: number, productId: number) {
		this.orderId = orderId
		this.quantity = quantity
		this.productId = productId
	}
}
