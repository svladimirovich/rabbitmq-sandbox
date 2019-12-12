package com.example.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

@org.springframework.context.annotation.Configuration
public class Configuration {

    @Value("${rabbit.exchange}")
    private String exchangeName;

    @Value("${rabbit.queue}")
    private String queueName;

    @Value("${rabbit.routingKey}")
    private String routingKey;

    @Bean
    public TopicExchange appExchange() {
        return new TopicExchange(exchangeName);
    }

    @Bean
    public Queue appQueue() {
        return new Queue(queueName);
    }

    @Bean
    public Binding declareBinding() {
        return BindingBuilder.bind(appQueue()).to(appExchange()).with(routingKey);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(final ConnectionFactory connectionFactory) {
        final var rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(producerJackson2MessageConverter());
        return rabbitTemplate;
    }

    @Bean
    public Jackson2JsonMessageConverter producerJackson2MessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
