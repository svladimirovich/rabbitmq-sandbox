module.exports = {
    rabbitHost: process.env.RABBIT_HOST || "127.0.0.1",
    exchangeName: process.env.EXCHANGE || "jobs_exchange",
    sourceQueue: process.env.SOURCE_QUEUE || "jobs_queue",
    sourceRoutingKey: process.env.SOURCE_ROUTING_KEY || "job_producer",
    targetRoutingKey: process.env.TARGET_ROUTING_KEY || "result_producer",
}