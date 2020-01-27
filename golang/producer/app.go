package main

import (
	"log"
	"time"

	"github.com/streadway/amqp"
)

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func produce() int {
	conn, err := amqp.Dial("amqp://guest:guest@192.168.1.4:5672/")
	 if err != nil {
		log.Printf("Failed to connect to RabbitMQ, will retry in 3 seconds ...");
		return 3;
	}
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	err := ch.ExchangeDeclare(
		"jobs_exchange",
		"topic",
		true,
		false,
		false,
		false,
		nil,
	)
	failOnError(err, "Failed to declare a queue")

	for {
		body := "Hello World!"
		err = ch.Publish(
			"jobs_exchange", // exchange
			"job_producer", // routing key
			false,  // mandatory
			false,  // immediate
			amqp.Publishing{
				ContentType: "text/plain",
				Body:        []byte(body),
			})
		log.Printf(" [x] Sent %s", body)
		failOnError(err, "Failed to publish a message")
		time.Sleep(1 * time.Second)
	}

	return 0
}

func main() {
	delay := 5
	for delay > 1 {
		delay = produce();
		time.Sleep(time.Duration(delay) * time.Second)
	}
}