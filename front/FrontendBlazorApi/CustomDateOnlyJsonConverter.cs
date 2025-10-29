using System;
using System.Text.Json;
using System.Text.Json.Serialization;

public class CustomDateOnlyJsonConverter : JsonConverter<DateOnly>
{
    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var dateString = reader.GetString();
        if (DateOnly.TryParseExact(dateString, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out var date))
        {
            return date;
        }
        throw new JsonException($"Unable to convert \"{dateString}\" to DateOnly.");
    }

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value.ToString("yyyy-MM-dd"));
    }
}