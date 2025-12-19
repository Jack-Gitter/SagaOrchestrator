import { UUID } from "node:crypto";

export interface Message {
	id: UUID,
	orderId: UUID,
	productId: number,
	quantity: number,
	success: boolean
}
