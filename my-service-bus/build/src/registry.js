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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRegistry = void 0;
// registry to manage microservices
class ServiceRegistry {
    constructor() {
        this.services = new Map();
    }
    // method to register a new service
    registerService(name, url) {
        if (!name || !url) {
            return 'Name and URL are required';
        }
        if (this.services.has(name)) {
            return 'Service already registered with this name';
        }
        this.services.set(name, { name, url });
        return 'Service registered successfully';
    }
    // method to remove an existing service
    removeService(name) {
        this.services.delete(name);
    }
    // method to get information about a service
    getService(name) {
        return this.services.get(name);
    }
    // method for listing all services
    listServices() {
        return Array.from(this.services.values());
    }
    // method to determine which microservice should handle a given request
    getMicroserviceForRequest(req) {
        // use the first part of the path to determine the service
        const serviceName = req.path.split('/')[1];
        return this.services.get(serviceName);
    }
    // method to forward a request to a microservice
    forwardRequestToMicroservice(service, req) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetch = (...args) => Promise.resolve().then(() => __importStar(require('node-fetch'))).then(({ default: fetch }) => {
                const [url, options] = args;
                return fetch(url, options);
            });
            const url = service.url + req.path;
            // convert IncomingHttpHeaders to a simple header object
            const headers = {};
            Object.entries(req.headers).forEach(([key, value]) => {
                if (value !== undefined) {
                    headers[key] = Array.isArray(value) ? value.join(',') : value;
                }
            });
            const response = yield fetch(url, {
                method: req.method,
                headers: headers,
                body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
            });
            return response.json();
        });
    }
}
exports.ServiceRegistry = ServiceRegistry;
