export enum ORDER_STATUS {
	PENDING = 'pending',
	CANCELED = 'canceled',
	FULFILLED = 'fulfilled'
}

export enum INBOX_MESSAGE_TYPE {
	RECEIVE_ORDER = 'createPendingOrder',
	INVENTORY_REMOVE_RESPONSE = 'inventoryRemoveResponse'
}

export enum OUTBOX_MESSAGE_TYPE {
	RESERVE_INVENTORY = 'reserveInventory',
	SHIP_PRODUCT = 'shipProduct'
}
