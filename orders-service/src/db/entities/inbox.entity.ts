import { UUID } from "node:crypto";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { INBOX_MESSAGE_TYPE } from "../types";

@Entity('inbox')
export class InboxMessage {
	@PrimaryGeneratedColumn('uuid')
	id: UUID

	@Column({type: 'uuid'})
	orderId: UUID

	@Column({type: 'enum', enum: INBOX_MESSAGE_TYPE})
	messageType: INBOX_MESSAGE_TYPE

	@Column()
	success: boolean

	@CreateDateColumn()
	createdAt: Date;
	
	@UpdateDateColumn()
	updatedAt: Date;

	constructor(orderId: UUID, messageType: INBOX_MESSAGE_TYPE, success: boolean) {
		this.orderId = orderId
		this.messageType = messageType
		this.success = success
	}
}
