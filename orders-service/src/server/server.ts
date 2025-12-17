import * as express from 'express'
import * as bodyParser from 'body-parser'
import { HTTP_METHOD } from './types'

export class Server {
	private app: express.Express

	constructor(private port: number) {
		this.app = express()
		this.app.use(bodyParser.json())
		this.registerRoute('/', HTTP_METHOD.GET, this.homeRoute)
		this.registerRoute('/', HTTP_METHOD.POST, this.placeOrder)
		this.listen()
	}

	private registerRoute(path: string, method: HTTP_METHOD, func: (req: express.Request, res: express.Response) => any) {
		if (method == 'get') {
			this.app.get(path, func)
		} else if (method == 'post') {
			this.app.post(path, func)
		}
	}

	private homeRoute(req: express.Request, res: express.Response) {
		res.send('Hello World!')
	}

	private placeOrder(req: express.Request, res: express.Response) {
		const {productId, quantity}: {productId: number, quantity: number} = req.body
		console.log(productId)
		console.log(quantity)
		res.send("ok!")
	}

	private listen() {
		this.app.listen(this.port, () => {
		  console.log(`Example app listening on port ${this.port}`)
		})
	}
}


