export interface SagaStepInterface<T, U> {

	invoke(data: T): Promise<void>

	compenstate(data: U): Promise<void>

}
