using System.Text;
using System.Text.Json;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Components.Endpoints;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Sprache;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        public readonly IHttpClientFactory _httpClientFactory;
        private readonly ApplicationDbContext _context;
        public ChatController(IHttpClientFactory httpClientFactory, ApplicationDbContext context)
        {
            _httpClientFactory = httpClientFactory;
            _context = context;
        }

        public class GetBookingsByResourceTypeDto
        {
            public DateTime BookingDate { get; set; }
            public string Timeslot { get; set; } = default!;
            public string? ResourceName { get; set; }
        }

        [HttpGet]
        public IEnumerable<GetBookingsByResourceTypeDto> GetBookingsByResourceType(bool includeDesks = false, bool includeMeetingRooms = false, bool includeVRset = false, bool includeAIserver = false)
        {
            var query = _context.Bookings
            .Include(b => b.Resource)
            .Where(b => b.EndDate > DateTime.UtcNow);

            if (includeDesks)
            {
                query = query.Where(b => b.Resource.ResourceTypeId == 1);
            }
            if (includeMeetingRooms)
            {
                query = query.Where(b => b.Resource.ResourceTypeId == 2);
            }
            if (includeVRset)
            {
                query = query.Where(b => b.Resource.ResourceTypeId == 3);
            }
            if (includeAIserver)
            {
                query = query.Where(b => b.Resource.ResourceTypeId == 4);
            }

            var bookingList = query.ToList();
            List<GetBookingsByResourceTypeDto> dtoList = new List<GetBookingsByResourceTypeDto>();
            
            foreach (Booking booking in bookingList)
            {
                dtoList.Add
                (
                    new GetBookingsByResourceTypeDto
                    {
                        BookingDate = booking.BookingDate,
                        Timeslot = booking.Timeslot == "FM" ? "Morning (8:00-12:00)" : "Afternoon (12:00-16:00)",
                        ResourceName = booking.Resource.Name
                    }
                );
            };

            return dtoList;
        }

        public record ChatRequest(string Message);

        [HttpPost]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            var http = _httpClientFactory.CreateClient("openai");

            var body = new
            {
                model = "gpt-4.1",
                input = new List<object>()
                {
                    new
                    {
                        role = "system",
                        content = "You are a booking assistant. You will answer questions about the availability of bookable resources."
                    },
                    new
                    {
                        role = "user",
                        content = request.Message
                    }
                },
                tools = new object[]
                {
                    new
                    {
                        type = "function",
                        name = "get_bookings_by_resource_type",
                        description = "Get active bookings from a certain resource type. To get the availability of resources you will have to look for desks without bookings. They all have names, for example Desk 1 or MeetingRoom 2. There are 15 desks, 4 meeting rooms, 4 vr headsets and 1 AI server. There are two timeslots, Morning (8:00-12:00) and Afternoon (12:00-16:00)",
                        parameters = new
                        {
                            type = "object",
                            properties = new
                            {
                                includeDesks = new
                                {
                                    type = "boolean",
                                    description = "If true, the function includes active bookings for desks. If false, the function does not include bookings for desks."
                                },
                                includeMeetingRooms = new
                                {
                                    type = "boolean",
                                    description = "If true, the function includes active bookings for meeting rooms. If false, the function does not include bookings for meeting rooms."
                                },
                                includeVRsets = new
                                {
                                    type = "boolean",
                                    description = "If true, the function includes active bookings for VR sets. If false, the function does not include bookings for VR sets."
                                },
                                includeAIservers = new
                                {
                                    type = "boolean",
                                    description = "If true, the function includes active bookings for AI servers. If false, the function does not include bookings for AI servers."
                                }
                            }
                        }
                    }
                }
            };

            var content = new StringContent(System.Text.Json.JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
            var response = await http.PostAsync("responses", content);

            var raw = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                System.Console.WriteLine("fel");
                return BadRequest("fel");
            }

            var doc = JsonDocument.Parse(raw);
            var root = doc.RootElement;

            var output = root.GetProperty("output");
            for (int i = 0; i < output.GetArrayLength(); i++)
            {
                body.input.Add(output[i]);

                var callType = output[i].GetProperty("type").ToString();
                if (callType != "function_call")
                {
                    continue;
                }

                var arguments = output[i].GetProperty("arguments").ToString();
                arguments = arguments.Replace("\"", "");

                if (arguments.Contains("includeDesks:true"))
                {
                    var result = GetBookingsByResourceType(true);
                    body.input.Add(new
                    {
                        type = "function_call_output",
                        call_id = output[i].GetProperty("call_id").ToString(),
                        output = System.Text.Json.JsonSerializer.Serialize(result.ToArray())
                    });
                }
                else if (arguments.Contains("includeMeetingRooms:true"))
                {
                    var result = GetBookingsByResourceType(false, true);
                    body.input.Add(new
                    {
                        type = "function_call_output",
                        call_id = output[i].GetProperty("call_id").ToString(),
                        output = System.Text.Json.JsonSerializer.Serialize(result.ToArray())
                    });
                }
                else if (arguments.Contains("includeVRsets:true"))
                {
                    var result = GetBookingsByResourceType(false, false, true);
                    body.input.Add(new
                    {
                        type = "function_call_output",
                        call_id = output[i].GetProperty("call_id").ToString(),
                        output = System.Text.Json.JsonSerializer.Serialize(result.ToArray())
                    });
                }
                else if (arguments.Contains("includeAIservers:true"))
                {
                    var result = GetBookingsByResourceType(false, false, false, true);
                    body.input.Add(new
                    {
                        type = "function_call_output",
                        call_id = output[i].GetProperty("call_id").ToString(),
                        output = System.Text.Json.JsonSerializer.Serialize(result.ToArray())
                    });
                }
            }

            content = new StringContent(System.Text.Json.JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");
            response = await http.PostAsync("responses", content);

            raw = await response.Content.ReadAsStringAsync();

            doc = JsonDocument.Parse(raw);
            root = doc.RootElement;

            string reply = root.GetProperty("output")[0]
            .GetProperty("content")[0].GetProperty("text").GetString() ?? "Inget svar";

            return Ok(reply);
        }
    }
}