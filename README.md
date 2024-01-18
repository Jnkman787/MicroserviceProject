# MicroserviceProject

Instructions:<br>
Create a Typescript or Go lang service repository.<br>
The service should be a bus that connects microservices
It should have a registry of microservices and route the traffic to the target service
It should allow to:
  -register new microservice
  -listen to commands or queries and redirect them to the target service
  -the result should be an event
  -service that was asking for data will listen for the response event
It should allow to use of multiple drivers, like kafka, rabbitmq, in memory - but for now, implement just one.
Create Dockerfile, so the project can be built and deployed to the cloud.
Cover the project in tests (not 100% required, but the most important).
Service should log the messages, and store them. There should be an HTTP endpoint to query for them.
