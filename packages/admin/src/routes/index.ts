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

    /**
     *  @swagger
     *  /api/products:
     *      post:
     *          summary: Add a product
     *          tags: [Products]
     *          requestBody:
     *              description: The Product to create
     *              required: true
     *              content:
     *                  application/json:
     *                      schema:
     *                          $ref: '#/definitions/NewProduct'
     *          responses:
     *              200:
     *                  description: The created Product
     *                  content:
     *                      application/json:
     *                          schema:
     *                              type: list
     *                              $ref: '#/components/schemas/Product'
     */
    router.post('/api/products', async (req: Request, res: Response) => {
        const product = await productRepo.create(req.body)
        const result = await productRepo.save(product)
        channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)))
        return res.send(result)
    })

    /**
     *  @swagger
     *  /api/products/{count}:
     *      post:
     *          summary: Add requested count of products
     *          tags: [Products]
     *          parameters:
     *              - in: path
     *                name: count
     *                required: true
     *                schema:
     *                  $ref: '#/definitions/Count'
     *                  description: The count of products to create
     *          responses:
     *              200:
     *                  description: OK
     */
    router.post('/api/products/:count', async (req: Request, res: Response) => {
        const totalToCreate= parseInt(req.params.count) || 1

        for (let i = 0; i < totalToCreate; i++) {
            const product = await productRepo.create({ title: `Title: ${uuidv4()}` })
            const result = await productRepo.save(product)
            channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)))
        }
        return res.sendStatus(200)
    })

    /**
     *  @swagger
     *  /api/products/{id}:
     *      patch:
     *          summary: Update a product
     *          tags: [Products]
     *          parameters:
     *              - in: path
     *                name: id
     *                required: true
     *                schema:
     *                  $ref: '#/definitions/ProductId'
     *                  description: The count of products to create
     *          requestBody:
     *              description: The Product to create
     *              required: true
     *              content:
     *                  application/json:
     *                      schema:
     *                          $ref: '#/definitions/NewProduct'
     *          responses:
     *              200:
     *                  description: The created Product
     *                  content:
     *                      application/json:
     *                          schema:
     *                              type: list
     *                              $ref: '#/components/schemas/Product'
     */
    router.patch('/api/products/:id', async (req: Request, res: Response) => {
        const product = await productRepo.findOne(req.params.id)
        productRepo.merge(product, req.body)
        const result = await productRepo.save(product)
        channel.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)))
        return res.send(result)
    })

    /**
     *  @swagger
     *  /api/products/{id}/like:
     *      patch:
     *          summary: Increment a product likes
     *          tags: [Products]
     *          parameters:
     *              - in: path
     *                name: id
     *                required: true
     *                schema:
     *                  $ref: '#/definitions/ProductId'
     *                  description: The product id
     *          responses:
     *              200:
     *                  description: The created Product
     *                  content:
     *                      application/json:
     *                          schema:
     *                              type: list
     *                              $ref: '#/components/schemas/Product'
     */
    router.patch('/api/products/:id/like', async (req: Request, res: Response) => {
        const product = await productRepo.findOne(req.params.id)
        product.likes++
        const result = await productRepo.save(product)
        channel.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)))
        return res.send(result)
    })

    /**
     *  @swagger
     *  /api/products/{id}:
     *      delete:
     *          summary: Delete a product
     *          tags: [Products]
     *          parameters:
     *              - in: path
     *                name: id
     *                required: true
     *                schema:
     *                  $ref: '#/definitions/ProductId'
     *                  description: The product id
     *          responses:
     *              200:
     *                  description: OK
     */
    router.delete('/api/products/:id', async (req: Request, res: Response) => {
        const result = await productRepo.delete(req.params.id)
        channel.sendToQueue('product_deleted', Buffer.from(req.params.id))
        return res.sendStatus(200)
    })

    return router
}
