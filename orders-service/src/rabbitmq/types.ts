import { UUID } from "node:crypto";

export interface ResponseMessage {
	id: UUID
	orderId: UUID
	success: boolean
}
