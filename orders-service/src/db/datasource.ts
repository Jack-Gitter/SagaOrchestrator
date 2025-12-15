import { DataSource } from "typeorm";

export const datasource = new DataSource({
	type: 'postgres',
	host: "localhost",
	port: Number(process.env.PORT),
	username: process.env.USERNAME,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
	migrations: []
})
