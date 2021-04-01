import * as express from 'express'
import * as cors from 'cors'
import * as pino from 'pino'
import * as expressPino from 'express-pino-logger'
import { routes } from './routes'
import { Product } from './entity/product'
import { connectToRabbitMQ, createRabbitMQChannel, createMySQLConnection } from './utils'

const app = express()
const PORT = 8000
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const expressLogger = expressPino({ logger });

app.use(expressLogger)
app.use(cors({ origin: ['http://localhost:3000'] }))
app.use(express.json())

async function main() {
    logger.info(`Initiating Admin Server`)
    // const db = await createMySQLConnection()
    // const connection = await connectToRabbitMQ()
    // const channel = await createRabbitMQChannel(connection)
    // const productRepo = db.getRepository(Product)
    // const appRoutes = routes(productRepo, channel)

    // app.use('/', appRoutes)

    app.listen(PORT, () => {
        logger.info(`Server listening on: http://localhost:${PORT}`)
    })

    // process.on('beforeExit', () => {
    //     connection.close()
    // })
}
main()
