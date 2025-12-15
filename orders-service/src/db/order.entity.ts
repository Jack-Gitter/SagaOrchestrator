import { UUID } from "node:crypto";
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { ORDER_STATUS } from "../types";

@Entity()
export class Order {

	@PrimaryColumn("uuid")
	orderId: UUID;
	
	@Column("int")
	quantity: number;
	
	@Column("int")
	productId: number;
	
	@Column({
		type: "enum",
		enum: ORDER_STATUS
	})
	status: ORDER_STATUS; 
	
	@CreateDateColumn()
	createdAt: Date;
	
	@UpdateDateColumn()
	updatedAt: Date;
	
	constructor(quantity: number, productId: number) {
		this.quantity = quantity;
		this.productId = productId;
		this.status = ORDER_STATUS.PENDING;
	}
}
