import * as express from 'express'
import { Request, Response } from 'express'
import * as cors from 'cors'
import { createConnection } from 'typeorm'

const app = express()
const PORT = 8001

createConnection().then(db => {
    app.use(cors({
        origin: ['http://localhost:3000']
    }))

    app.use(express.json())

    app.listen(PORT, () => {
        console.log(`Server listening on: http://localhost:${PORT}`)
    })
})
