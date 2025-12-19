import { UUID } from "node:crypto";
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from "typeorm";
import { INBOX_MESSAGE_TYPE } from "./types";

@Entity('inbox')
export class InboxMessage {
	@Column({type: 'uuid', primary: true})
	id: UUID

	@Column({type: 'uuid'})
	orderId: UUID

	@Column()
	productId: number

	@Column()
	quantity: number

	@Column({type: 'enum', enum: INBOX_MESSAGE_TYPE})
	messageType: INBOX_MESSAGE_TYPE

	@CreateDateColumn()
	createdAt: Date;
	
	@UpdateDateColumn()
	updatedAt: Date;

	constructor(id: UUID, orderId: UUID, messageType: INBOX_MESSAGE_TYPE) {
		this.id = id
		this.orderId = orderId
		this.messageType = messageType
	}
}
