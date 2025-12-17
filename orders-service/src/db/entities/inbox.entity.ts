import { UUID } from "node:crypto";
import { Column, Entity } from "typeorm";
import { INBOX_MESSAGE_TYPE } from "../types";

@Entity('inbox')
export class Inbox {
	@Column({type: 'uuid', primary: true})
	orderId: UUID

	@Column({type: 'enum', enum: INBOX_MESSAGE_TYPE})
	messageType: INBOX_MESSAGE_TYPE

	@Column()
	success: boolean

	constructor(orderId: UUID, messageType: INBOX_MESSAGE_TYPE, success: boolean) {
		this.orderId = orderId
		this.messageType = messageType
		this.success = success
	}


}
