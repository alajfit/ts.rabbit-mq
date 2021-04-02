import * as express from 'express'
import * as cors from 'cors'
import * as pino from 'pino'
import * as expressPino from 'express-pino-logger'
import { createMongoDBConnection } from './utils'

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

    app.listen(PORT, () => {
        console.log(`Server listening on: http://localhost:${PORT}`)
    })
}
main()
