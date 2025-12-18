export enum ORDER_STATUS {
	PENDING = 'pending',
	CANCELED = 'canceled',
	FULFILLED = 'fulfilled'
}

export enum INBOX_MESSAGE_TYPE {
	RECEIVE_ORDER = 'createPendingOrder',
	INVENTORY_REMOVE_RESPONSE = 'inventoryRemoveResponse',
	SHIPPING_RESPONSE = 'shipping_response'
}

export enum OUTBOX_MESSAGE_TYPE {
	REMOVE_INVENTORY = 'removeInventory',
	SHIP_PRODUCT = 'shipProduct'
}

export enum STATE {
	CREATE_ORDER = 'create_order',
	WAIT_FOR_INVENTORY_RESPONSE = 'wait_for_inventory_response',
	HANDLE_INVENTORY_RESPONSE = 'handle_inventory_response',
	WAIT_FOR_SHIPPING_RESPONSE = 'wait_for_shipping_response',
	HANDLE_SHIPPING_RESPONSE = 'handle_shipping_response',
	ERROR = 'error',
	COMPLETE = 'complete'
}
