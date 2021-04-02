import * as path from 'path'
import * as swaggerJsdoc from 'swagger-jsdoc'
import * as pkg from '../../package.json'

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Admin API with Swagger',
            version: pkg.version,
            description:
                'This is a simple CRUD API application made with Express and documented with Swagger',
            license: {
                name: "MIT",
            url: "https://spdx.org/licenses/MIT.html",
        },
        contact: {
            name: '@alajfit',
            url: 'https://github.com/alajfit/ts.rabbit-mq/issues',
            email: "info@email.com",
        },
    },
    servers: [
        {
            url: 'http://localhost:8000',
        },
    ],
    },
    apis: [
        path.join(__dirname, '..', 'routes/index.js'),
        path.join(__dirname, '..', 'routes/swagger.js')
    ],
};

export const swaggerSpecs = swaggerJsdoc(options);
