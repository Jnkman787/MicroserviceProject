FROM node:16

WORKDIR /my-service-bus

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["node", "build/index.js"]