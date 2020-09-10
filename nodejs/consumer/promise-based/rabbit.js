const amqp = require('amqplib');
const config = require('../config');

const context = {
    currentMessage : null,
    sourceBinding : null,
    sourceQueue : null,
    exchange : null,
    channel : null,
    connectionError : null,
    connection : null,
}

const assertConnection = function () {
    if (this.connection) {
        //console.log("using cached connection");
        return Promise.resolve(this.connection);
    } else {
        //console.log("creating connection...")
        return amqp.connect(`amqp://${config.rabbitHost}`).then(connection => {
            this.connection = connection;
            this.connectionError = new Promise((resolve, reject) => {
                connection.on("error", error => {
                    reject(error);
                });
                connection.on("close", () => {
                    resolve();
                });
            })
            return connection;
        });    
    }
}.bind(context);

const assertChannel = function (connection) {
    if (this.channel) {
        //console.log("using cached channel");
        return Promise.resolve(this.channel);
    } else {
        //console.log("creating channel...")
        return connection.createConfirmChannel().then(channel => {
            this.channel = channel;
            return channel;
        });
    }
}.bind(context);

const assertExchange = function (channel) {
    if (this.exchange) {
        //console.log("using cached exchange");
        return Promise.resolve(this.exchange);
    } else {
        //console.log("creating exchange...")
        return channel.assertExchange(config.exchangeName, 'topic', { durable: true }).then(exchange => {
            this.exchange = exchange;
            return exchange;
        });
    }
}.bind(context);

const assertSourceQueue = function (channel) {
    if (this.sourceQueue) {
        return Promise.resolve(this.sourceQueue);
    } else {
        //console.log("creating source queue...")
        return channel.assertQueue(config.sourceQueue, { durable: true }).then(queue => {
            this.sourceQueue = queue;
            return queue;
        });
    }
}.bind(context);

const assertSourceBinding = function (channel, exchange, queue) {
    if (this.sourceBinding) {
        return Promise.resolve(this.sourceBinding);
    } else {
        //console.log("creating source queue & exchange binding...")
        return channel.bindQueue(queue.queue, exchange.exchange, config.sourceRoutingKey).then(sourceBinding => {
            this.sourceBinding = sourceBinding;
            return sourceBinding;
        });    
    }
}.bind(context);

async function consume() {
    if (this.currentMessage) {
        throw new Error("You need to ack or nack your current message before consuming the next one!");
    }
    let connection = await assertConnection();
    let channel = await assertChannel(connection);
    let queue = await assertSourceQueue(channel);
    let exchange = await assertExchange(channel);
    await assertSourceBinding(channel, exchange, queue);
    this.currentMessage = await channel.get(queue.queue);
    if (!this.currentMessage) { // false is returned if there are no messages in queue
        this.currentMessage = null;
        return null;
    } else {
        //console.log("returning message", this.currentMessage);
        return JSON.parse(this.currentMessage.content);
    }
}

function getCurrentMessage() {
    return this.currentMessage;
}

async function ack() {
    if (this.currentMessage) {
        let connection = await assertConnection();
        let channel = await assertChannel(connection);
        let message = this.currentMessage;
        this.currentMessage = null;
        return channel.ack(message);
    } else {
        throw new Error("There is no current message set that you can ack()");
    }
}

async function nack() {
    if (this.currentMessage) {
        let connection = await assertConnection();
        let channel = await assertChannel(connection);
        let message = this.currentMessage;
        this.currentMessage = null;
        return channel.nack(message);
    } else {
        throw new Error("There is no current message set that you can nack()");
    }
}

async function publish(message) {
    let connection = await assertConnection();
    let channel = await assertChannel(connection);
    let exchange = await assertExchange(channel);
    const publi$h = new Promise((resolve, reject) => {
        channel.publish(exchange.exchange, config.targetRoutingKey, Buffer.from(JSON.stringify(message)), { persistent: true }, (error, ok) => {
            if (error) {
                reject(error);
            } else {
                resolve(ok);
            }
        });
    });
    return await Promise.race([publi$h, this.connectionError]);
}

async function reset() {
    if (this.connection) {
        await this.connection.close();
    }
    this.currentMessage = null;
    this.sourceBinding = null;
    this.sourceQueue = null;
    this.exchange = null;
    this.channel = null;
    this.connectionError = null;
    this.connection = null;
}

module.exports = {
    consume: consume.bind(context),
    getCurrentMessage: getCurrentMessage.bind(context),
    ack: ack.bind(context),
    nack: nack.bind(context),
    publish: publish.bind(context),
    reset: reset.bind(context),
}