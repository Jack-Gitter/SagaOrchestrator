import * as express from 'express'
import * as bodyParser from 'body-parser'
import { HTTP_METHOD } from './types'
import { OrderSagaOrchestrator } from 'src/orders/saga/orders.saga.orchestrator'

export class Server {
	private app: express.Express

	constructor(private port: number, private orderSagaOrchestrator: OrderSagaOrchestrator) {}

	init() {
		this.app = express()
		this.app.use(bodyParser.json())
		this.registerRoute('/', HTTP_METHOD.POST, this.placeOrder)
		this.listen()
	}

	private placeOrder = async (req: express.Request, res: express.Response) => {
		const {productId, quantity}: {productId: number, quantity: number} = req.body
		if (!productId || !quantity) {
			res.status(400).send('No product or quantity')
		}
		await this.orderSagaOrchestrator.newSaga(productId, quantity)
		res.send()
	}

	private registerRoute = (path: string, method: HTTP_METHOD, func: (req: express.Request, res: express.Response) => any) => {
		switch(method) {
			case HTTP_METHOD.GET: 
				this.app.get(path, func)
				break;
			case HTTP_METHOD.POST: 
				this.app.post(path, func)
				break;
			default: 
				throw new Error('not supported')
		}
	}

	private listen = () => {
		this.app.listen(this.port, () => {
		  console.log(`Example app listening on port ${this.port}`)
		})
	}
}


