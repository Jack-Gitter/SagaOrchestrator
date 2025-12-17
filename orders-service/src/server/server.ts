import * as express from 'express'

export class Server {
	private app: express.Express

	constructor(private port: number) {
		this.app = express()
		this.registerRoute('/', this.homeRoute)
		this.listen()
	}

	private registerRoute(path: string, func: (req: express.Request, res: express.Response) => any) {
		this.app.get(path, func)
	}

	private homeRoute(req: express.Request, res: express.Response) {
		res.send('Hello World!')
	}

	private listen() {
		this.app.listen(this.port, () => {
		  console.log(`Example app listening on port ${this.port}`)
		})
	}
}


