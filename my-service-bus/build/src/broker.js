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
exports.subscribeToQueue = exports.publishMessage = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const logger_1 = __importDefault(require("./logger"));
// function to establish a connection to RabbitMQ
const connectRabbitMQ = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const connection = yield amqplib_1.default.connect('amqp://localhost'); // adjust the URL as needed
        const channel = yield connection.createChannel();
        return channel;
    }
    catch (error) {
        logger_1.default.error(`Error connecting to RabbitMQ: ${error}`);
        throw error;
    }
});
// function to publish messages to a specified queue
const publishMessage = (channel, queue, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue, Buffer.from(message));
    }
    catch (error) {
        logger_1.default.error(`Error publishing message: ${error}`);
        throw error;
    }
});
exports.publishMessage = publishMessage;
// function to subscribe to a specified queue and handle messages using a callback
const subscribeToQueue = (channel, queue, callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield channel.assertQueue(queue, { durable: false });
        channel.consume(queue, message => {
            if (message !== null) {
                callback(message.content.toString());
                channel.ack(message);
            }
        });
    }
    catch (error) {
        logger_1.default.error(`Error subscribing to queue: ${error}`);
        throw error;
    }
});
exports.subscribeToQueue = subscribeToQueue;
exports.default = connectRabbitMQ;
