export interface SagaStepInterface {

	run(): Promise<void>

	compenstate(): Promise<void>

}
