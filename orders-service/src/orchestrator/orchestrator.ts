import { DataSource } from "typeorm";
import {setup, Actor, createActor, assign } from "xstate";

export class OrderSagaOrchestrator {
	
	
	private sagas = new Map<number, Actor<any>>();

	constructor(private datasource: DataSource) {}

	initializeOrderAction(orderId: number, productId: number, quantity: number) {
		const orderMachine = setup({
		  types: {
			events: {} as { type: 'success' } | { type: 'failure' },
		  },
		  actions: { 
			  orderRecievedAction: this.orderRecievedAction
		  },
		}).createMachine({
		  id: orderId.toString(),
		  initial: 'orderReceived',
		  states: {
			orderReceived: {
			  on: { 
				success: {
					target: 'reserveInventory', 
					actions: {
						type: 'orderRecievedAction', 
						params: {
							dataSource: this.datasource
						}
					}
				},
				failure: 'final', 
			  },
			},
			reserveInventory: {
			  on: { 
				success: 'shipOrder',
				failure: 'final', 
			  },
			},
			shipOrder: {
			  on: { 
				success: 'final', 
				failure: 'shipOrderRollback', 
			  },
			},
			shipOrderRollback: {
			  on: { 
				success: 'reserveInventoryRollback', 
				failure: 'error', 
			  },
			},
			reserveInventoryRollback: {
			  on: { 
				success: 'final', 
				failure: 'error', 
			  },
			},
			final: {},
			error: {}
		  },
		});

		const actor = createActor(orderMachine);
		actor.start()
		this.sagas.set(orderId, actor)
	}

	private orderRecievedAction(_, params: {dataSource: DataSource}) {
	}

	private reserveInventoryAction(orderId: number) {}

	private initiateShippingAction(orderId: number) {}

	private removeInventoryAction(orderId: number) {}
}
