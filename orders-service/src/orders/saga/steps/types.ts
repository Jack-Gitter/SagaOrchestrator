import { UUID } from "node:crypto";
import { OrderSaga } from "../orders.saga";

export interface OrderSagaStepData {
	orderId: UUID,
	productId: number,
	quantity: number,
	orderSaga: OrderSaga
}
