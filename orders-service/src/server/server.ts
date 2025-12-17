import * as express from 'express'
import bodyParser from 'body-parser'

export class Server {
	private app: express.Express

	constructor(private port: number) {
		this.app = express()
		this.app.use(bodyParser.json())
		this.registerRoute('/', this.homeRoute)
		this.listen()
	}

	private registerRoute(path: string, func: (req: express.Request, res: express.Response) => any) {
		this.app.get(path, func)
	}

	private homeRoute(req: express.Request, res: express.Response) {
		res.send('Hello World!')
	}

	private placeOrder(req: express.Request, res: express.Response) {

	}

	private listen() {
		this.app.listen(this.port, () => {
		  console.log(`Example app listening on port ${this.port}`)
		})
	}
}


