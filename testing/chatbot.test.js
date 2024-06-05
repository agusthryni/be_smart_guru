const request = require("supertest");
const baseUrl = "http://besg-test.panti.my.id";

describe("OpenAI Chat API", () => {
  it("Berhasil mengirim pesan dengan argumen message valid [200]", async () => {
    const message = "Apa itu fotosintesis?"; // What is photosynthesis? (Indonesian)
    const res = await request(baseUrl).post("/chat").send({ message });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("answer");
  });

  it("Gagal mengirim pesan karena argumen message kosong [400]", async () => {
    const res = await request(baseUrl).post("/chat").send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Message is required");
  });
});
