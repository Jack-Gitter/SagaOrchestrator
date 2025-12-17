export enum ORDER_STATUS {
	PENDING = 'pending',
	CANCELED = 'canceled',
	FULFILLED = 'fulfilled'
}

export enum MESSAGE_TYPE {
	RECEIVE_ORDER = 'createPendingOrder',
	INVENTORY_REMOVE_RESPONSE = 'inventoryRemoveResponse'
}
