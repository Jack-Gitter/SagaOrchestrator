import { UUID } from "node:crypto";
import { OUTBOX_MESSAGE_TYPE } from "./types";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('outbox')
export class OutboxMessage {
	@PrimaryGeneratedColumn('uuid')
	id: UUID

	@Column({type: 'uuid'})
	orderId: UUID

	@Column({type: 'enum', enum: OUTBOX_MESSAGE_TYPE})
	messageType: OUTBOX_MESSAGE_TYPE

	@Column()
	success: boolean

	@CreateDateColumn()
	createdAt: Date;
	
	@UpdateDateColumn()
	updatedAt: Date;

	constructor(orderId: UUID, success: boolean, messageType: OUTBOX_MESSAGE_TYPE) {
		this.orderId = orderId
		this.messageType = messageType
		this.success = success
	}

	public toJson = () => ({
		id: this.id,
		orderId: this.orderId,
		success: this.success,
	})
}
