import * as amqp from 'amqplib/callback_api'
import * as pino from 'pino'
import { createConnection, Connection, ConnectionOptions } from 'typeorm'
import { Product } from '../entity/product'

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const createMongoDBConnection = (): Promise<Connection> => {
    const options: ConnectionOptions = {
        type: 'mongodb',
        database: 'mongodb',
        host: process.env.NODE_ENV === 'development' ? 'localhost' : 'mongodb',
        port: 27017,
        username: 'user',
        password: 'password',
        logging: 'all',
        synchronize: true,
        entities: [Product],
        cli: {
            entitiesDir: 'dist/entity'
        }
    }

    return new Promise((resolve, reject) => {
        try {
            logger.debug('Attemping MongoDB Connection');
            createConnection(options).then(db => {
                resolve(db)
            })
        } catch(err) {
            console.log('--ISSUE WITH CONNECTING TO MongoDB--')
            reject(err)
        }
    })
}

export const connectToRabbitMQ = (): Promise<amqp.Connection> => {
    const rabbitMQUrl = `amqp://user:password@${process.env.NODE_ENV === 'development' ? 'localhost' : 'rabbitmq'}:5672`

    return new Promise((resolve, reject) => {
        amqp.connect(rabbitMQUrl, (errConnecting, connection) => {
            if (errConnecting)
                reject(errConnecting)
            else
                resolve(connection)
        })
    })
}

export const createRabbitMQChannel = (connection: amqp.Connection): Promise<amqp.Channel> => {
    return new Promise((resolve, reject) => {
        connection.createChannel((errCreateChannel, channel) => {
            if (errCreateChannel)
                reject(errCreateChannel)
            else
                resolve(channel)
        })
    })
}
