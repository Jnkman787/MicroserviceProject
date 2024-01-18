import express, { ErrorRequestHandler } from 'express';
import logger from './logger';
import { ServiceRegistry } from './registry';
import { routeRequest } from './router';
import connectRabbitMQ, { subscribeToQueue } from './broker';
import { Channel } from 'amqplib';
import path from 'path';

const app = express();
const port = 3000;
const serviceRegistry = new ServiceRegistry();
let channel: Channel | null = null;

app.use(express.json()); // middleware for JSON parsing

// establish RabbitMQ connection
connectRabbitMQ().then(ch => {
    channel = ch;
    subscribeToQueue(channel, 'responseQueue', handleMessage);
}).catch(err => logger.error(`Failed to connect to RabbitMQ: ${err.message}`));

// endpoint to register a new service
app.post('/register', (req, res) => {
    const { name, url } = req.body;
    if (!name || !url) {
        return res.status(400).send('Name and URL are required');
    }
    const result = serviceRegistry.registerService(name, url);
    if (result === 'Service registered successfully') {
        res.status(200).send(`Registered service ${name} at ${url}`);
    } else {
        res.status(400).send(result);
    }
});

// endpoint to remove a service
app.post('/deregister', (req, res) => {
    const { name } = req.body;
    serviceRegistry.removeService(name);
    res.status(200).send(`Deregistered service ${name}`);
});

// endpoint to get information about a service
app.get('/service/:name', (req, res) => {
    const service = serviceRegistry.getService(req.params.name);
    if (service) {
        res.status(200).json(service);
    } else {
        res.status(404).send('Service not found');
    }
});

const requestMap = new Map<string, { res: express.Response }>();

// use routeRequest for handling all types of incoming HTTP requests
app.all('*', async (req, res) => {
    try {
        if (!channel) {
            throw new Error('RabbitMQ channel is not established');
        }
        await routeRequest(req, res, channel, requestMap);
    } catch (err) {
        const error = err as Error;
        logger.error(error.message);
        res.status(500).send('Failed to route request');
    }
});

app.get('/logs', (req, res) => {
    const logFilePath = path.join(__dirname, '..', 'log', 'combined.log');
    res.sendFile(logFilePath, (err) => {
        if (err) {
            logger.error(`Error sending log file: ${err.message}`);
            res.status(500).send('Error retrieving log file');
        }
    });
});  

// middleware for error handling
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    res.status(500).send('Internal Server Error');
};

app.use(errorHandler);

app.listen(port, () => {
    logger.info(`Service bus listening at http://localhost:${port}`);
});

function handleMessage(message: string) {
    try {
        const msgObj = JSON.parse(message);
        const { requestId, responseData, service } = msgObj;

        logger.info(`Received response from ${service} for request ${requestId}`);

        // process the response
        processResponse(requestId, responseData);
    } catch (err) {
        if (err instanceof Error) {
            logger.error(`Error processing message: ${err.message}`);
        } else {
            logger.error('Unknown error processing message');
        }
    }
}

function processResponse(requestId: string, responseData: any) {
    const requestContext = requestMap.get(requestId);

    if (requestContext) {
        // respond to the original HTTP request
        requestContext.res.status(200).json(responseData);
        requestMap.delete(requestId); // clean up
    } else {
        logger.error(`No matching HTTP request context for requestId ${requestId}`);
    }
}