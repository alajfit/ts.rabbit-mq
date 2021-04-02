import { Router, Request, Response } from 'express'
import { Channel } from 'amqplib/callback_api'
import { Repository } from 'typeorm'
import { uuidv4 } from '../utils'
import { Product } from '../entity/product'

export const routes = (productRepo: Repository<Product>, channel: Channel) => {
    const router = Router()

    /**
     *  @swagger
     *  /api/products:
     *      get:
     *          summary: Lists all the Products
     *          tags: [Products]
     *          produces:
     *              - "application/json"
     *          responses:
     *              200:
     *                  description: The list of Products
     *                  content:
     *                      application/json:
     *                          schema:
     *                              type: list
     *                              $ref: '#/components/schemas/Product'
     */
    router.get('/api/products', async (req: Request, res: Response) => {
        const products = await productRepo.find()
        return res.json(products)
    })

    /**
     *  @swagger
     *  /api/products/{id}:
     *      get:
     *          summary: Lists all the Products
     *          tags: [Products]
     *          produces:
     *              - "application/json"
     *          parameters:
     *              - in: path
     *                name: id
     *                required: true
     *                schema:
     *                  $ref: '#/definitions/ProductId'
     *                  description: The product id
     *          responses:
     *              200:
     *                  description: The list of Products
     *                  content:
     *                      application/json:
     *                          schema:
     *                              type: list
     *                              $ref: '#/components/schemas/Product'
     */
    router.get('/api/products/:id', async (req: Request, res: Response) => {
        const product = await productRepo.findOne(req.params.id)
        return res.send(product)
    })

    router.post('/api/products', async (req: Request, res: Response) => {
        const product = await productRepo.create(req.body || { title: `Title: ${uuidv4()}` })
        const result = await productRepo.save(product)
        channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)))
        return res.send(result)
    })

    router.post('/api/products/:count', async (req: Request, res: Response) => {
        const totalToCreate= parseInt(req.params.count) || 1

        for (let i = 0; i < totalToCreate; i++) {
            const product = await productRepo.create({ title: `Title: ${uuidv4()}` })
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
