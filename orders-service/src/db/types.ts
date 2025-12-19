export enum ORDER_STATUS {
	PENDING = 'pending',
	CANCELED = 'canceled',
	FULFILLED = 'fulfilled'
}

export enum INBOX_MESSAGE_TYPE {
	CREATE_ORDER = 'createPendingOrder',
	INVENTORY_RESPONSE = 'inventoryResponse',
	REMOVE_INVENTORY_LOCAL = 'removeInventoryLocal',
	SHIPPING_RESPONSE = 'shippingResponse',
}

export enum OUTBOX_MESSAGE_TYPE {
	REMOVE_INVENTORY_LOCAL = 'removeInventoryLocal',
	REMOVE_INVENTORY = 'removeInventory',
	SHIP_ORDER = 'shipOrder',
	RESTORE_INVENTORY = 'restoreInventory',
	SHIP_ORDER_CANCEL = 'shipOrderCancel',
}

