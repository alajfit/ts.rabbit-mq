import * as express from 'express'
import { Request, Response } from 'express'
import * as cors from 'cors'
import { createConnection } from 'typeorm'
import { Product } from './entity/product'
import * as amqp from 'amqplib/callback_api'

const app = express()
const PORT = 8000

const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    });
}

createConnection().then(db => {
    const productRepo = db.getRepository(Product)

    amqp.connect('amqp://user:password@localhost:5672', (errConnecting, connection) => {
        if (errConnecting) throw errConnecting

        connection.createChannel((errCreateChannel, channel) => {
            if (errCreateChannel) throw errCreateChannel

            app.use(cors({
                origin: ['http://localhost:3000']
            }))

            app.use(express.json())

            app.get('/api/products', async (req: Request, res: Response) => {
                const products = await productRepo.find()
                return res.json(products)
            })

            app.get('/api/products/:id', async (req: Request, res: Response) => {
                const product = await productRepo.findOne(req.params.id)
                return res.send(product)
            })

            app.post('/api/products', async (req: Request, res: Response) => {
                const product = await productRepo.create(req.body)
                const result = await productRepo.save(product)
                channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)))
                return res.send(result)
            })

            app.post('/api/products/:count', async (req: Request, res: Response) => {
                const totalToCreate= parseInt(req.params.count) || 1

                for (let i = 0; i < totalToCreate; i++) {
                    const product = await productRepo.create({ title: `Title: ${uuidv4()}` })
                    const result = await productRepo.save(product)
                    channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)))
                }
                return res.sendStatus(200)
            })

            app.patch('/api/products/:id', async (req: Request, res: Response) => {
                const product = await productRepo.findOne(req.params.id)
                productRepo.merge(product, req.body)
                const result = await productRepo.save(product)
                channel.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)))
                return res.send(result)
            })

            app.patch('/api/products/:id/like', async (req: Request, res: Response) => {
                const product = await productRepo.findOne(req.params.id)
                product.likes++
                const result = await productRepo.save(product)
                channel.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)))
                return res.send(result)
            })

            app.delete('/api/products/:id', async (req: Request, res: Response) => {
                const result = await productRepo.delete(req.params.id)
                channel.sendToQueue('product_deleted', Buffer.from(req.params.id))
                return res.send(result)
            })

            app.listen(PORT, () => {
                console.log(`Server listening on: http://localhost:${PORT}`)
            })

            process.on('beforeExit', () => {
                connection.close()
            })
        })
    })
})
