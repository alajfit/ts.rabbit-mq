import * as express from 'express'
import { Request, Response } from 'express'
import * as cors from 'cors'
import { createConnection } from 'typeorm'
import { Product } from './entity/product'

const app = express()
const PORT = 8000

createConnection().then(db => {
    const productRepo = db.getRepository(Product)

    app.use(cors({
        origin: ['http://localhost:3000']
    }))

    app.use(express.json())

    app.get('/api/products', async (req: Request, res: Response) => {
        const products = await productRepo.find()
        res.json(products)
    })

    app.listen(PORT, () => {
        console.log(`Server listening on: http://localhost:${PORT}`)
    })
})
