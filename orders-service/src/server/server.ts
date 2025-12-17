import * as express from 'express'
import * as bodyParser from 'body-parser'
import { HTTP_METHOD } from './types'
import { OrdersSagaOrchestrator } from 'src/orders/orders.orchestrator'

export class Server {
	private app: express.Express

	constructor(private port: number, private orderSagaOrchestrator: OrdersSagaOrchestrator) {
		this.app = express()
		this.app.use(bodyParser.json())
		this.registerRoute('/', HTTP_METHOD.GET, this.homeRoute)
		this.registerRoute('/', HTTP_METHOD.POST, this.placeOrder)
		this.listen()
	}

	private placeOrder = async (req: express.Request, res: express.Response) => {
		const {productId, quantity}: {productId: number, quantity: number} = req.body
		this.orderSagaOrchestrator.createPendingOrder(productId, quantity)
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

	private homeRoute = (req: express.Request, res: express.Response) => {
		res.send('Hello World!')
	}

	private listen = () => {
		this.app.listen(this.port, () => {
		  console.log(`Example app listening on port ${this.port}`)
		})
	}
}


