using System;
using System.Collections;
using System.Linq;

namespace Producer
{
    class Program
    {
        public static Random Random = new Random();

        public static readonly string WorkerId = null;

        static void Main(string[] args)
        {
            Console.WriteLine("dotnet producer started...");
            var producer = new MessageProducer();

            while(true) {
                try {
                    producer.produce();
                } catch(RabbitMQ.Client.Exceptions.BrokerUnreachableException ex) {
                    Console.WriteLine($"Error while producing jobs to RabbitMQ:{producer.rabbitHost} Queue:{producer.queueName} - {ex.Message}");
                    Console.WriteLine("Next retry in 3 seconds...");
                    System.Threading.Thread.Sleep(3000);
                }
            }
        }

        static Program() {
            Program.WorkerId = generateRandomHexString(12);
        }

        private static string generateRandomHexString(int maxLength) {
            var hexString = getRandomHexChar(maxLength).Cast<string>().ToArray();
            return String.Join("", hexString).ToLower();
        }

        private static IEnumerable getRandomHexChar(int maxLength) {
            for (int i = 0; i < maxLength; i++) {
                yield return Random.Next(16).ToString("X");
            }
        }
    }
}
