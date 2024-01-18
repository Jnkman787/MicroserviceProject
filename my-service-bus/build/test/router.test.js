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
const router_1 = require("../src/router");
const registry_1 = require("../src/registry");
const broker = __importStar(require("../src/broker"));
jest.mock('../src/logger');
jest.mock('../src/registry');
jest.mock('../src/broker');
describe('routeRequest', () => {
    let mockRequest;
    let mockResponse;
    let mockChannel;
    let mockRequestMap;
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
        registry_1.ServiceRegistry.prototype.getMicroserviceForRequest.mockReturnValue({
            name: 'testservice',
            url: 'http://localhost:3000'
        });
        broker.publishMessage.mockResolvedValue(undefined);
    });
    test('should route request to the correct service', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, router_1.routeRequest)(mockRequest, mockResponse, mockChannel, mockRequestMap);
        expect(registry_1.ServiceRegistry.prototype.getMicroserviceForRequest).toHaveBeenCalledWith(mockRequest);
        expect(broker.publishMessage).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Request sent to microservice: testservice');
    }));
    test('should handle microservice not found', () => __awaiter(void 0, void 0, void 0, function* () {
        registry_1.ServiceRegistry.prototype.getMicroserviceForRequest.mockReturnValue(undefined);
        yield (0, router_1.routeRequest)(mockRequest, mockResponse, mockChannel, mockRequestMap);
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Microservice not found');
    }));
});
