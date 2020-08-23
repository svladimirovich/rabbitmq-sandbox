namespace Producer
{
    public class Job {
        public string title { get; set; }
        public int amount { get; set; }
        public System.DateTime createDate { get; set; }
        public string creator { get; set; }
        public string creatorPlatform { get; set; }
        // public string executor { get; set; }
        // public string executorPlatform { get; set; }
        // public DateTime executionDate { get; set; }

        public Job(string title, int amount) {
            this.title = title;
            this.amount = amount;
            createDate = System.DateTime.Now;
            creator = Program.WorkerId;
            creatorPlatform = "csharp";
        }
    }
}