import { UUID } from "node:crypto";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OUTBOX_MESSAGE_TYPE } from "../types";

@Entity('outbox')
export class OutboxMessage {
	@PrimaryGeneratedColumn('uuid')
	id: UUID

	@Column({type: 'uuid'})
	orderId: UUID

	@Column('int')
	quantity: number

	@Column('int')
	productId: number

	@Column({type: 'enum', enum: OUTBOX_MESSAGE_TYPE})
	messageType: OUTBOX_MESSAGE_TYPE

	@CreateDateColumn()
	createdAt: Date;
	
	@UpdateDateColumn()
	updatedAt: Date;

	constructor(orderId: UUID, productId: number, quantity: number, messageType: OUTBOX_MESSAGE_TYPE) {
		this.orderId = orderId
		this.quantity = quantity
		this.productId = productId
		this.messageType = messageType
	}
}
