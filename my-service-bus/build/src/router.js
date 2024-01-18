"use strict";
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
exports.routeRequest = void 0;
const registry_1 = require("./registry");
const logger_1 = __importDefault(require("./logger"));
const broker_1 = require("./broker");
const uuid_1 = require("uuid");
const serviceRegistry = new registry_1.ServiceRegistry();
function generateRequestId() {
    return (0, uuid_1.v4)();
}
function routeRequest(req, res, channel, requestMap) {
    return __awaiter(this, void 0, void 0, function* () {
        logger_1.default.info(`Routing request: ${req.method} ${req.path}`);
        const service = serviceRegistry.getMicroserviceForRequest(req);
        if (!service) {
            logger_1.default.warn(`Microservice not found for path: ${req.path}`);
            res.status(404).send('Microservice not found');
            return;
        }
        try {
            const requestId = generateRequestId(); // generate unique IDs
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
            yield (0, broker_1.publishMessage)(channel, targetQueue, JSON.stringify(requestDetails));
            //const response = await serviceRegistry.forwardRequestToMicroservice(service, req);
            logger_1.default.info(`Request published to ${targetQueue}`);
            res.status(200).send(`Request sent to microservice: ${service.name}`);
        }
        catch (error) {
            logger_1.default.error(`Error routing request: ${error instanceof Error ? error.message : 'Unknown error'}`);
            res.status(500).send('Error routing request');
        }
    });
}
exports.routeRequest = routeRequest;
