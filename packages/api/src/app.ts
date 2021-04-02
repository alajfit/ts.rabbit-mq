import * as express from 'express'
import * as cors from 'cors'
import * as pino from 'pino'
import * as expressPino from 'express-pino-logger'
import { Product } from './entity/product'
import { createMongoDBConnection, connectToRabbitMQ, createRabbitMQChannel } from './utils'

const app = express()
const PORT = 8001
const logger = pino({ level: process.env.LOG_LEVEL || 'info', prettyPrint: { colorize: true } });
const expressLogger = expressPino({ logger });

app.use(expressLogger)
app.use(cors({ origin: ['http://localhost:3000'] }))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

async function main() {
    const db = await createMongoDBConnection()
    const connection = await connectToRabbitMQ()
    const channel = await createRabbitMQChannel(connection)
    const productRepo = db.getRepository(Product)

    channel.assertQueue('product_created', { durable: true })
    channel.assertQueue('product_updated', { durable: true })
    channel.assertQueue('product_deleted', { durable: true })

    channel.consume('product_created', (msg) => {
        const eventProduct = JSON.parse(msg.content.toString())
        console.log('MESSAGE: ', eventProduct)
    })

    app.listen(PORT, () => {
        console.log(`Server listening on: http://localhost:${PORT}`)
    })
}
main()
