export enum ORDER_STATUS {
	PENDING = 'pending',
	CANCELED = 'canceled',
	FULFILLED = 'fulfilled'
}

export enum INBOX_MESSAGE_TYPE {
	CREATE_ORDER = 'createPendingOrder',
	INVENTORY_RESPONSE = 'inventoryResponse',
	SHIPPING_RESPONSE = 'shippingResponse',
	FINALIZE_ORDER = 'finalizeOrder'
}

export enum OUTBOX_MESSAGE_TYPE {
	REMOVE_INVENTORY = 'removeInventory',
	SHIP_PRODUCT = 'shipProduct',
	RESTORE_INVENTORY = 'restoreInventory',
	SHIP_PRODUCT_CANCEL = 'shipProductCancel',
	FINALIZE_ORDER = 'finalizeOrder'
}

