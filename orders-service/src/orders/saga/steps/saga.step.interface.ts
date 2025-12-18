export interface SagaStepInterface<T, U> {

	run(data: T): Promise<void>

	compenstate(data: U): Promise<void>

}
