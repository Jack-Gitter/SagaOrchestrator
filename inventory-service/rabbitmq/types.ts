import { UUID } from "node:crypto";

export interface Message {
	id: UUID,
	orderId: UUID,
	success: boolean
}
