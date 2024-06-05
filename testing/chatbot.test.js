const request = require("supertest");
const baseUrl = "http://besg-test.panti.my.id";

describe("OpenAI Chat API", () => {
  it("Responds with error for missing message parameter [400]", async () => {
    const res = await request(baseUrl).post("/chat").send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Message is required");
  });

  it("Responds with a successful answer for a valid message [200]", async () => {
    const message = "Apa itu fotosintesis?"; // What is photosynthesis? (Indonesian)
    const res = await request(baseUrl).post("/chat").send({ message });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("reply");
  });

  // Test for message length
  it("Responds with error for message exceeding character limit [400]", async () => {
    const longMessage = " ".repeat(4001); // Creates a string with 4001 spaces
    const res = await request(baseUrl)
      .post("/chat")
      .send({ message: longMessage });
    expect(res.statusCode).toEqual(400); // Adjust if error code changes
    expect(res.body).toHaveProperty("msg"); // Check for specific error message if available
  });

  // Test for handling unexpected errors
  it("Responds with error for internal server errors [500]", async () => {
    jest.spyOn(console, "error").mockImplementationOnce(() => {}); // Simulate error
    const message = "Valid message";
    const res = await request(baseUrl).post("/chat").send({ message });
    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty(
      "msg",
      "Failed to fetch response from OpenAI"
    );
  });
});
