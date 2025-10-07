using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        public readonly IHttpClientFactory _httpClientFactory;

        public ChatController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public record ChatRequest(string Message);

        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            var http = _httpClientFactory.CreateClient("openai");

            var body = new
            {
                model = "gpt-4.1",
                input = new object[]
                {
                    new
                    {
                        role = "system",
                        content = "You are chatgpt"
                    },
                    new
                    {
                        role = "user",
                        content = request.Message
                    }
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
            var response = await http.PostAsync("responses", content);

            var raw = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                System.Console.WriteLine("fel");
                return BadRequest("fel");
            }

            var doc = JsonDocument.Parse(raw);
            var root = doc.RootElement;

            string reply = root.GetProperty("output")[0]
            .GetProperty("content")[0].GetProperty("text").GetString() ?? "Inget svar";

            return Ok(reply);
        }
    }
}
