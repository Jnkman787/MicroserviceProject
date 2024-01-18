import { Request, Response } from 'express';
import { ServiceRegistry } from './registry';
import logger from './logger';
import { publishMessage } from './broker';
import { Channel } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

const serviceRegistry = new ServiceRegistry();

function generateRequestId(): string {
    return uuidv4();
}

export async function routeRequest(req: Request, res: Response, channel: Channel, requestMap: Map<string, { res: Response }>) {
    logger.info(`Routing request: ${req.method} ${req.path}`);

    const service = serviceRegistry.getMicroserviceForRequest(req);

    if (!service) {
        logger.warn(`Microservice not found for path: ${req.path}`);
        res.status(404).send('Microservice not found');
        return;
    }

    try {
        const requestId = generateRequestId();  // generate unique IDs
        requestMap.set(requestId, { res });

        // serialize request details
        const requestDetails = {
            method: req.method,
            path: req.path,
            body: req.body,
            headers: req.headers
        };

        // determine the target queue based on the service
        const targetQueue = service.name;

        // publish the message to the queue
        await publishMessage(channel, targetQueue, JSON.stringify(requestDetails));

        //const response = await serviceRegistry.forwardRequestToMicroservice(service, req);

        logger.info(`Request published to ${targetQueue}`);
        res.status(200).send(`Request sent to microservice: ${service.name}`);
    } catch (error) {
        logger.error(`Error routing request: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.status(500).send('Error routing request');
    }
}