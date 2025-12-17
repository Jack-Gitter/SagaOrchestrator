import { UUID } from "node:crypto";
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from "typeorm";
import { OUTBOX_MESSAGE_TYPE } from "../types";

@Entity('outbox')
export class Outbox {
	@Column({type: 'uuid', primary: true})
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

	constructor(orderId: UUID, quantity: number, productId: number, messageType: OUTBOX_MESSAGE_TYPE) {
		this.orderId = orderId
		this.quantity = quantity
		this.productId = productId
		this.messageType = messageType
	}
}
