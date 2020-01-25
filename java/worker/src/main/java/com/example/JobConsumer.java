package com.example;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Date;

@Service
@Profile("consumer")
public class JobConsumer {

    @Value("${rabbit.jobs.exchange}")
    private String exchangeName;

    @Value("${rabbit.results.routingKey}")
    private String routingKey;

    private static final Logger log = LoggerFactory.getLogger(JobConsumer.class);
    private final RabbitTemplate rabbitTemplate;

    public JobConsumer(final RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = "${rabbit.jobs.queue}")
    public void receiveMessage(final Job job) {
        try {
            Thread.sleep(1000);
            job.setExecutionDate(new Date());
            try {
                job.setExecutor(InetAddress.getLocalHost().getHostName());
            } catch(UnknownHostException e) {
                job.setExecutor("Unknown Host");
            }
            job.setExecutorPlatform("java");
            rabbitTemplate.convertAndSend(exchangeName, routingKey, job);
        } catch(InterruptedException ie) {}
        log.info("Received job: {}", job.toString());
    }
}
