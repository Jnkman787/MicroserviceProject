import { Request } from 'express';

// structure of a microservice
interface Microservice {
    name: string;
    url: string; // network address where the microservice can be reached
}

// registry to manage microservices
class ServiceRegistry {
    private services: Map<string, Microservice>;

    constructor() {
        this.services = new Map();
    }

    // method to register a new service
    registerService(name: string, url: string): string {
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
    removeService(name: string): void {
        this.services.delete(name);
    }

    // method to get information about a service
    getService(name: string): Microservice | undefined {
        return this.services.get(name);
    }

    // method for listing all services
    listServices(): Microservice[] {
        return Array.from(this.services.values());
    }

    // method to determine which microservice should handle a given request
    getMicroserviceForRequest(req: Request): Microservice | undefined {
        // use the first part of the path to determine the service
        const serviceName = req.path.split('/')[1];
        return this.services.get(serviceName);
    }

    // method to forward a request to a microservice
    async forwardRequestToMicroservice(service: Microservice, req: Request): Promise<any> {
        // define the types for URL and options
        type URLString = string;
        type RequestOptions = { method?: string; headers?: Record<string, string>; body?: any };
        
        const fetch = (...args: [URLString, RequestOptions?]) => import('node-fetch').then(({ default: fetch }) => {
            const [url, options] = args;
            return fetch(url, options);
        });

        const url = service.url + req.path;
    
        // convert IncomingHttpHeaders to a simple header object
        const headers: Record<string, string> = {};
        Object.entries(req.headers).forEach(([key, value]) => {
            if (value !== undefined) {
                headers[key] = Array.isArray(value) ? value.join(',') : value;
            }
        });
    
        const response = await fetch(url, {
            method: req.method,
            headers: headers,
            body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
        });
    
        return response.json();
    }    
}

// export the registry
export { ServiceRegistry, Microservice };