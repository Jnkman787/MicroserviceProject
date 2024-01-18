"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../src/registry");
describe('ServiceRegistry', () => {
    let registry;
    beforeEach(() => {
        registry = new registry_1.ServiceRegistry();
    });
    test('should register a service correctly', () => {
        const serviceName = 'testService';
        const serviceUrl = 'http://localhost:3000';
        const result = registry.registerService(serviceName, serviceUrl);
        expect(result).toBe('Service registered successfully');
        expect(registry.getService(serviceName)).toEqual({ name: serviceName, url: serviceUrl });
    });
    test('should not register a service without a name or url', () => {
        const resultWithoutName = registry.registerService('', 'http://localhost:3000');
        const resultWithoutUrl = registry.registerService('testService', '');
        expect(resultWithoutName).toBe('Name and URL are required');
        expect(resultWithoutUrl).toBe('Name and URL are required');
    });
    test('should not register a service with a duplicate name', () => {
        const serviceName = 'testService';
        registry.registerService(serviceName, 'http://localhost:3000');
        const result = registry.registerService(serviceName, 'http://localhost:3001');
        expect(result).toBe('Service already registered with this name');
    });
    test('should remove a service correctly', () => {
        const serviceName = 'testService';
        registry.registerService(serviceName, 'http://localhost:3000');
        registry.removeService(serviceName);
        expect(registry.getService(serviceName)).toBeUndefined();
    });
    test('should list all registered services', () => {
        registry.registerService('service1', 'http://localhost:3000');
        registry.registerService('service2', 'http://localhost:3001');
        const services = registry.listServices();
        expect(services.length).toBe(2);
        expect(services).toEqual(expect.arrayContaining([
            { name: 'service1', url: 'http://localhost:3000' },
            { name: 'service2', url: 'http://localhost:3001' }
        ]));
    });
});
