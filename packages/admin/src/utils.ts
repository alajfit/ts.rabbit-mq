import * as amqp from 'amqplib/callback_api'
import * as pino from 'pino'
import { createConnection, Connection, ConnectionOptions } from 'typeorm'
import { Product } from './entity/product'

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    });
}

export const createMySQLConnection = (): Promise<Connection> => {
    const options: ConnectionOptions = {
        type: 'mysql',
        database: 'mysqldb',
        host: process.env.NODE_ENV === 'development' ? 'localhost' : 'mysqldb',
        port: 3306,
        username: 'user',
        password: 'password',
        logging: 'all',
        synchronize: true,
        entities: [Product]
    }

    return new Promise((resolve, reject) => {
        try {
            logger.debug('Attemping MySQL Connection');
            createConnection(options).then(db => {
                resolve(db)
            })
        } catch(err) {
            console.log('--ISSUE WITH CONNECTING TO MYSQL DB--')
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
