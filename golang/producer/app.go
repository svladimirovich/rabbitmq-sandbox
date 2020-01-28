package main

import (
	"log"
	"time"
	"strings"
	"fmt"
	"os"

	"github.com/streadway/amqp"
)

type Message struct {
	Title string
	Amount int
	CreateDate time.Time
	Creator string
	CreatorPlatform string
	Executor string
	ExecutorPlatform string
	ExecutionDate time.Time
}

var hostName string

func failOnError(err error, msg string) {
	if err != nil {
		log.Fatalf("%s: %s", msg, err)
	}
}

func createMessage() Message {
	msg := Message{
		Title: "from GoLang job producer",
		Amount: 5,
		CreatorPlatform: "golang",
	}
	return msg
}

func toJSON(message Message) string {
	var builder strings.Builder
	builder.WriteString("{")
	fmt.Fprintf(&builder, "\"title\":\"%s\",", message.Title)
	fmt.Fprintf(&builder, "\"amount\":\"%d\",", message.Amount)
	fmt.Fprintf(&builder, "\"createDate\":%d,", time.Now().UnixNano() / 1000000)
	fmt.Fprintf(&builder, "\"creator\":\"%s\",", hostName)
	fmt.Fprintf(&builder, "\"creatorPlatform\":\"%s\"", message.CreatorPlatform)
	builder.WriteString("}")
	return builder.String()
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

	err = ch.ExchangeDeclare(
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

		message := createMessage()
		body := toJSON(message)

		log.Printf(" Created message %s", body)

		err = ch.Publish(
			"jobs_exchange", // exchange
			"job_producer", // routing key
			false,  // mandatory
			false,  // immediate
			amqp.Publishing{
				ContentType: "application/json",
				Body:        []byte(body),
			})
		log.Printf(" [x] Sent %s", body)
		failOnError(err, "Failed to publish a message")
		time.Sleep(1 * time.Second)
	}

	return 0
}

func main() {
	hname, err := os.Hostname()
	if err != nil {
		failOnError(err, "Could not retrieve host name")
	}
	hostName = hname
	log.Printf("Running on host %s", hostName)

	delay := 5
	for delay > 1 {
		delay = produce();
		time.Sleep(time.Duration(delay) * time.Second)
	}
}