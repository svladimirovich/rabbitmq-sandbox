const WebSocket = require('ws');
const npmRequest = require('request');
const { interval } = require('rxjs');
const amqp = require('amqplib');

const targetQueue = process.env.TARGET_QUEUE || "jobs_queue";
const resultRoutingKey = process.env.RESULT_ROUTING_KEY || "result_producer";
const rabbitHost = process.env.RABBIT_HOST || "localhost"; //"rabbit";
const rabbitApiPort = parseInt(process.env.RABBIT_API_PORT) || 15672;
const server = new WebSocket.Server({ port: parseInt(process.env.HOST_PORT) || 8080 });

// server.on('connection', ws => {
//     ws.send('You are connected to NodeJS backend through WebSocket!');
// });

function broadcast(message) {
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

async function getQueueProperties(queueName) {
    const url = `http://${rabbitHost}:${rabbitApiPort}/api/queues/%2F/${queueName}`;
    return new Promise((resolve, reject) => {
        npmRequest(url, { headers: { 
            "Authorization" : `Basic ${new Buffer("guest:guest").toString("base64")}`
        }}, (error, response, body) => {
            if (error) {
                reject(error);
            }
            if (response && response.statusCode == 200) {
                resolve(JSON.parse(body));
            } else if(response && response.statusCode == 404) {
                reject(`Queue with name '${queueName}' does not exist`);
            } else {
                reject(`Unexpected response: ${response && response.statusCode}`);
            }
        });
    });
}

function monitorQueue(queueName) {
    return interval(1000).subscribe(counter => {
        const queueDetails = {
            type: "QUEUE_STATE",
            name: queueName
        }
        getQueueProperties(queueDetails.name).then(response => {
            queueDetails.consumers = response.consumers;
            queueDetails.messages = response.messages;
            queueDetails.state = response.state;
            broadcast(JSON.stringify(queueDetails));
        }).catch(error => {
            queueDetails.error = error;
            broadcast(JSON.stringify(queueDetails));
        });
    });
}

function consumeResults(routingKey) {
    amqp.connect(`amqp://${rabbitHost}`).then(connection => {
        return connection.createChannel()
    }).then(channel => {
        return channel.assertQueue('', { exclusive: true, autoDelete: true }).then(q => {
            return channel.bindQueue(q.queue, "jobs_exchange", routingKey).then(_ => {
                return channel.consume(q.queue, message => {
                    if (message !== null) {
                        broadcast(JSON.stringify({
                            type: "RESULT_MESSAGE",
                            ...JSON.parse(message.content.toString()),
                        }));
                        channel.ack(message);
                    }
                });
            });
        });
    }).catch(error => {
        console.log("Error during consumption:", error);
        // retry until connected
        setTimeout(_ => {
            consumeResults(routingKey);
        }, 3000);
    })
}

monitorQueue(targetQueue);
consumeResults(resultRoutingKey);

console.log("WebSocket host started!");