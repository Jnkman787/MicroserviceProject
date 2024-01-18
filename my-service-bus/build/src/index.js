"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("./logger"));
const registry_1 = require("./registry");
const router_1 = require("./router");
const broker_1 = __importStar(require("./broker"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3000;
const serviceRegistry = new registry_1.ServiceRegistry();
let channel = null;
app.use(express_1.default.json()); // middleware for JSON parsing
// establish RabbitMQ connection
(0, broker_1.default)().then(ch => {
    channel = ch;
    (0, broker_1.subscribeToQueue)(channel, 'responseQueue', handleMessage);
}).catch(err => logger_1.default.error(`Failed to connect to RabbitMQ: ${err.message}`));
// endpoint to register a new service
app.post('/register', (req, res) => {
    const { name, url } = req.body;
    if (!name || !url) {
        return res.status(400).send('Name and URL are required');
    }
    const result = serviceRegistry.registerService(name, url);
    if (result === 'Service registered successfully') {
        res.status(200).send(`Registered service ${name} at ${url}`);
    }
    else {
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
    }
    else {
        res.status(404).send('Service not found');
    }
});
const requestMap = new Map();
// use routeRequest for handling all types of incoming HTTP requests
app.all('*', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!channel) {
            throw new Error('RabbitMQ channel is not established');
        }
        yield (0, router_1.routeRequest)(req, res, channel, requestMap);
    }
    catch (err) {
        const error = err;
        logger_1.default.error(error.message);
        res.status(500).send('Failed to route request');
    }
}));
app.get('/logs', (req, res) => {
    const logFilePath = path_1.default.join(__dirname, '..', 'log', 'combined.log');
    res.sendFile(logFilePath, (err) => {
        if (err) {
            logger_1.default.error(`Error sending log file: ${err.message}`);
            res.status(500).send('Error retrieving log file');
        }
    });
});
// middleware for error handling
const errorHandler = (err, req, res, next) => {
    logger_1.default.error(`Error: ${err.message}`);
    res.status(500).send('Internal Server Error');
};
app.use(errorHandler);
app.listen(port, () => {
    logger_1.default.info(`Service bus listening at http://localhost:${port}`);
});
function handleMessage(message) {
    try {
        const msgObj = JSON.parse(message);
        const { requestId, responseData, service } = msgObj;
        logger_1.default.info(`Received response from ${service} for request ${requestId}`);
        // process the response
        processResponse(requestId, responseData);
    }
    catch (err) {
        if (err instanceof Error) {
            logger_1.default.error(`Error processing message: ${err.message}`);
        }
        else {
            logger_1.default.error('Unknown error processing message');
        }
    }
}
function processResponse(requestId, responseData) {
    const requestContext = requestMap.get(requestId);
    if (requestContext) {
        // respond to the original HTTP request
        requestContext.res.status(200).json(responseData);
        requestMap.delete(requestId); // clean up
    }
    else {
        logger_1.default.error(`No matching HTTP request context for requestId ${requestId}`);
    }
}
