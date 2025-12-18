export enum ORDER_STATUS {
	PENDING = 'pending',
	CANCELED = 'canceled',
	FULFILLED = 'fulfilled'
}

export enum INBOX_MESSAGE_TYPE {
	CREATE_ORDER = 'createPendingOrder',
	INVENTORY_RESPONSE = 'inventoryResponse',
	SHIPPING_RESPONSE = 'shippingResponse'
}

export enum OUTBOX_MESSAGE_TYPE {
	REMOVE_INVENTORY = 'removeInventory',
	SHIP_PRODUCT = 'shipProduct'
}

