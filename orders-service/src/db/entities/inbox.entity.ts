import { UUID } from "node:crypto";
import { Column, Entity } from "typeorm";
import { MESSAGE_TYPE } from "../types";

@Entity('inbox')
export class InboxMessage {
	@Column({type: 'uuid', primary: true})
	orderId: UUID

	@Column({type: 'enum', enum: MESSAGE_TYPE})
	messageType: MESSAGE_TYPE


	constructor(orderId: UUID, messageType: MESSAGE_TYPE) {
		this.orderId = orderId
		this.messageType = messageType
	}


}
