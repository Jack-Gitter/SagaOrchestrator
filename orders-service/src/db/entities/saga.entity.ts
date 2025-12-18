import { UUID } from "node:crypto";
import { Column, Entity } from "typeorm";
import { STEP } from "./types";

@Entity('saga')
export class OrderSagaEntity {

	@Column({type: 'uuid', primary: true})
	orderId: UUID

	@Column()
	productId: number

	@Column()
	quantity: number

	@Column({type: 'enum', enum: STEP})
	lastCompletedStep: STEP 

	constructor(orderId: UUID, productId: number, quantity: number, lastCompletedStep: STEP) {
		this.orderId = orderId
		this.productId = productId
		this.quantity = quantity
		this.lastCompletedStep = lastCompletedStep
	}

}
