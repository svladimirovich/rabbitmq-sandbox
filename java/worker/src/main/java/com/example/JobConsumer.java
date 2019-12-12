package com.example;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("consumer")
public class JobConsumer {

    private static final Logger log = LoggerFactory.getLogger(JobConsumer.class);

    @RabbitListener(queues = "${rabbit.queue}")
    public void receiveMessage(final Job job) {
        log.info("Received job: {}", job.toString());
    }
}
