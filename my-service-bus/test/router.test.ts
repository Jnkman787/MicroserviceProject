import { Request, Response } from 'express';
import { Channel } from 'amqplib';
import { routeRequest } from '../src/router';
import { ServiceRegistry } from '../src/registry';
import logger from '../src/logger';
import * as broker from '../src/broker';

jest.mock('../src/logger');
jest.mock('../src/registry');
jest.mock('../src/broker');

describe('routeRequest', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockChannel: Partial<Channel>;
    let mockRequestMap: Map<string, { res: Response }>;

    beforeEach(() => {
        mockRequest = {
            method: 'GET',
            path: '/testservice',
            body: {},
            headers: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
        mockChannel = {};
        mockRequestMap = new Map();

        (ServiceRegistry.prototype.getMicroserviceForRequest as jest.Mock).mockReturnValue({
            name: 'testservice',
            url: 'http://localhost:3000'
        });
        (broker.publishMessage as jest.Mock).mockResolvedValue(undefined);
    });

    test('should route request to the correct service', async () => {
        await routeRequest(mockRequest as Request, mockResponse as Response, mockChannel as Channel, mockRequestMap);

        expect(ServiceRegistry.prototype.getMicroserviceForRequest).toHaveBeenCalledWith(mockRequest);
        expect(broker.publishMessage).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Request sent to microservice: testservice');
    });

    test('should handle microservice not found', async () => {
        (ServiceRegistry.prototype.getMicroserviceForRequest as jest.Mock).mockReturnValue(undefined);

        await routeRequest(mockRequest as Request, mockResponse as Response, mockChannel as Channel, mockRequestMap);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Microservice not found');
    });
});