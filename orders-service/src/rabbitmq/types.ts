import { UUID } from "node:crypto";

export enum QUEUE {
	REMOVE_INVENTORY = 'remove_inventory',
	REMOVE_INVENTORY_RESPONSE = 'remove_inventory_response',
	SHIP_ORDER = 'ship_order',
	SHIP_ORDER_RESPONSE = 'ship_order_response'
}

export interface InventoryResponseMessage {
	id: UUID,
	orderId: UUID,
	successful: boolean
}
