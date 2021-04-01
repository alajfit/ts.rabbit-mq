import { Router, Request, Response } from 'express'
import { Channel } from 'amqplib/callback_api'
import { Repository } from 'typeorm'
import { uuidv4 } from '../utils'
import { Product } from '../entity/product'

export const routes = (productRepo: Repository<Product>, channel: Channel) => {
    const router = Router()

    router.get('/api/products', async (req: Request, res: Response) => {
        const products = await productRepo.find()
        return res.json(products)
    })

    router.get('/api/products/:id', async (req: Request, res: Response) => {
        const product = await productRepo.findOne(req.params.id)
        return res.send(product)
    })

    router.post('/api/products', async (req: Request, res: Response) => {
        const product = productRepo.create(req.body)
        const result = await productRepo.save(product)
        channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)))
        return res.send(result)
    })

    router.post('/api/products/:count', async (req: Request, res: Response) => {
        const totalToCreate= parseInt(req.params.count) || 1

        for (let i = 0; i < totalToCreate; i++) {
            const product = productRepo.create({ title: `Title: ${uuidv4()}` })
            const result = await productRepo.save(product)
            channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)))
        }
        return res.sendStatus(200)
    })

    router.patch('/api/products/:id', async (req: Request, res: Response) => {
        const product = await productRepo.findOne(req.params.id)
        productRepo.merge(product, req.body)
        const result = await productRepo.save(product)
        channel.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)))
        return res.send(result)
    })

    router.patch('/api/products/:id/like', async (req: Request, res: Response) => {
        const product = await productRepo.findOne(req.params.id)
        product.likes++
        const result = await productRepo.save(product)
        channel.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)))
        return res.send(result)
    })

    router.delete('/api/products/:id', async (req: Request, res: Response) => {
        const result = await productRepo.delete(req.params.id)
        channel.sendToQueue('product_deleted', Buffer.from(req.params.id))
        return res.send(result)
    })

    return router
}
