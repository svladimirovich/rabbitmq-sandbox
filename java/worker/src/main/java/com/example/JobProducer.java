package com.example;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@Profile("producer")
public class JobProducer {

    @Value("${rabbit.jobs.exchange}")
    private String exchangeName;

    @Value("${rabbit.jobs.routingKey}")
    private String routingKey;

    private static final Logger log = LoggerFactory.getLogger(JobProducer.class);
    private final RabbitTemplate rabbitTemplate;

    public JobProducer(final RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Scheduled(fixedDelay = 1000L)
    public void sendMessage() {
        final Job job = new Job("from Spring job producer", 3 + new Random().nextInt(10));
        log.info("Java: generating Job...");
        rabbitTemplate.convertAndSend(exchangeName, routingKey, job);
    }
}
