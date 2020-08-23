using System;
using RabbitMQ.Client;
using System.Text;
using Newtonsoft.Json;

namespace Producer
{
    public class MessageProducer {

        public string rabbitHost { get; }
        public string queueName { get; }
        public string exchangeName { get; }
        public string routingKey { get; }

        public MessageProducer() {
            this.rabbitHost = System.Environment.GetEnvironmentVariable("RABBIT_HOST") ?? "127.0.0.1";
            this.queueName = System.Environment.GetEnvironmentVariable("TARGET_QUEUE") ?? "jobs_queue";
            this.exchangeName = System.Environment.GetEnvironmentVariable("EXCHANGE") ?? "jobs_exchange";
            this.routingKey = System.Environment.GetEnvironmentVariable("TARGET_ROUTING_KEY") ?? "job_producer";
        }

        public void produce() {
            var factory = new ConnectionFactory() { HostName = this.rabbitHost };
            using(var connection = factory.CreateConnection())
            using(var channel = connection.CreateModel()) {
                channel.QueueDeclare(queue: this.queueName,
                    durable: true,
                    exclusive: false,
                    autoDelete: false,
                    arguments: null);
                channel.ExchangeDeclare(this.exchangeName, type: "topic", durable: true, autoDelete: false);
                channel.QueueBind(this.queueName, this.exchangeName, this.routingKey);

                while(true) {
                    string message = generateMessage();
                    var body = Encoding.UTF8.GetBytes(message);
                    channel.BasicPublish(exchange: this.exchangeName,
                        routingKey: this.routingKey,
                        basicProperties: null,
                        body: body);
                    Console.WriteLine(" [x] Sent {0}", message);            
                    System.Threading.Thread.Sleep(1000);
                }
            }
        }

        private string generateMessage() {
            Job job = new Job("from DotNet job producer", Program.Random.Next(3, 13));
            string message = JsonConvert.SerializeObject(job, Formatting.None, new CustomDateTimeConverter());
            return message;
        }
    }
}