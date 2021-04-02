import { Express } from 'express'
import * as swaggerUi from 'swagger-ui-express'
import { swaggerSpecs } from '../swagger'

export function swaggerSetup(app: Express) {
    app.use(
        '/swagger',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpecs, { explorer: true })
    )

    /**
     *  @swagger
     *  components:
     *      schemas:
     *          Product:
     *              type: object
     *              required:
     *                  - title
     *              properties:
     *                  id:
     *                      type: integer
     *                      description: The auto-generated id of the Product.
     *                  title:
     *                      type: string
     *                      description: The title of the Product.
     *                  likes:
     *                      type: string
     *                      description: Product Likes
     *              example:
     *                  id: 1
     *                  title: Product Title
     *                  likes: 0
     */

    /**
     *  @swagger
     *  tags:
     *      name: Products
     *      description: API to manage Products.
     */

    /**
     *  @swagger
     *  definitions:
     *      ProductId:
     *          type: string
     *          minimum: 1
     */

    /**
     *  @swagger
     *  definitions:
     *      Count:
     *          type: number
     *          minimum: 1
     */

    /**
     *  @swagger
     *  definitions:
     *      NewProduct:
     *          type: object
     *          required:
     *              - title
     *          properties:
     *              title:
     *                  type: string
     */
}
