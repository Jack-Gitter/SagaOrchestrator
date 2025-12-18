import { UUID } from "node:crypto";
import { OrderSaga } from "../orders.saga";

export interface OrderSagaStepData {
	messageId?: UUID,
	orderId: UUID,
	productId: number,
	quantity: number,
	orderSaga: OrderSaga
}
