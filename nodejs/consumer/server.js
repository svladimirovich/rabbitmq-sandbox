const rabbit = require('./promise-based/rabbit');

const workerId = require('os').hostname();

const delay = (miliseconds) => new Promise(resolve => setTimeout(resolve, miliseconds));

async function process() {
    const messageObject = await rabbit.consume();
    if (rabbit.getCurrentMessage()) {
        console.log("Processing job: ", JSON.stringify(messageObject));
        // set execution date
        messageObject.executionDate = new Date().getTime();
        // set executor platform
        messageObject.executorPlatform = "nodejs";
        // set executor (id? host?)
        messageObject.executor = workerId;
        try {
            await rabbit.publish(messageObject);
            await rabbit.ack();
        } catch(error) {
            await rabbit.nack();
            throw error;
        }
    } else {
        console.log("No message in queue, skipping...");
    }
}

async function main() {
    while(true) {
        try {
            await process();
            await delay(1000);
        } catch(error) {
            console.log("Error while processing item", error);
            console.log("Resetting connection, will retry in 3 seconds...");
            await rabbit.reset();
            await delay(3000);
        }
    }
}

main();