import { UUID } from "node:crypto";

export interface InventoryResponseMessage {
	id: UUID
	orderId: UUID
	success: boolean
}
