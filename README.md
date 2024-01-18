# MicroserviceProject

Instructions:<br>
Create a Typescript or Go lang service repository.<br>
The service should be a bus that connects microservices<br>
It should have a registry of microservices and route the traffic to the target service<br>
It should allow to:<br>
  -register new microservice<br>
  -listen to commands or queries and redirect them to the target service<br>
  -the result should be an event<br>
  -service that was asking for data will listen for the response event<br>
It should allow to use of multiple drivers, like kafka, rabbitmq, in memory - but for now, implement just one.<br>
Create Dockerfile, so the project can be built and deployed to the cloud.<br>
Cover the project in tests (not 100% required, but the most important).<br>
Service should log the messages, and store them. There should be an HTTP endpoint to query for them.<br>
