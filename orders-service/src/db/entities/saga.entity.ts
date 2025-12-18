import { UUID } from "node:crypto";
import { Column, Entity } from "typeorm";
import { LAST_COMPLETED_STEP } from "./types";

@Entity('saga')
export class OrderSagaEntity {

	@Column({type: 'uuid', primary: true})
	orderId: UUID

	@Column()
	productId: number

	@Column()
	quantity: number

	@Column({type: 'enum', enum: LAST_COMPLETED_STEP})
	lastCompletedStep: LAST_COMPLETED_STEP 

	constructor(orderId: UUID, productId: number, quantity: number, lastCompletedStep: LAST_COMPLETED_STEP) {
		this.orderId = orderId
		this.productId = productId
		this.quantity = quantity
		this.lastCompletedStep = lastCompletedStep
	}

}
