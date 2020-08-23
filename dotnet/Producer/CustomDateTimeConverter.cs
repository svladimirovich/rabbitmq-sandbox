using System;
using Newtonsoft.Json;

namespace Producer {
    public class CustomDateTimeConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return objectType.Equals(typeof(DateTime));
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            return new DateTime((long)existingValue);
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (value is DateTime) {
                // number of milliseconds since January 1, 1970, 00:00:00 UTC (the ECMAScript epoch, equivalent to the UNIX epoch)
                long ticks = CustomDateTimeConverter.ToUnixTicks((DateTime)value) / 10000;
                writer.WriteValue(ticks);
            }
        }

        private static long ToUnixTicks(DateTime source) {
            long UnixEpochTicks = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc).Ticks;        
            return source.ToUniversalTime().Ticks - UnixEpochTicks;
        }
    }
}