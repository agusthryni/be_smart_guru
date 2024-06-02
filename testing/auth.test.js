const request = require("supertest");
const app = "http://besg-test.panti.my.id";

describe("register endpoint", () => {
  it("should register with valid parameters", async () => {
    const res = await request(app).post("/register").send({
      name: "Agus",
      email: "agus7@gmail.com",
      password: "agus123",
      verify_password: "agus123",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("msg", "Successfuly created the account");
  });

  it("should return 400 if passwords do not match", async () => {
    const res = await request(app).post("/register").send({
      name: "Agus",
      email: "agus3@gmail.com",
      password: "agus123",
      verify_password: "differentpassword",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Password doesn't match");
  });

  it("should return 400 if some params are empty", async () => {
    const res = await request(app).post("/register").send({
      name: "",
      email: "agus4@gmail.com",
      password: "agus123",
      verify_password: "agus123",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "msg",
      "Parameter has null or invalid values"
    );
  });

  it("should return 500 if user registration fails", async () => {
    const res = await request(app).post("/register").send({
      name: "Agus",
      email: "agus5@gmail.com",
      password: "agus123",
      verify_password: "agus123",
    });
    if (res.statusCode === 200) {
      await request(app).delete(`/users/${res.body.id}`);
    } else {
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty("msg", "Failed to register user");
    }
  });
});

describe("login endpoint", () => {
  it("should login with valid credentials", async () => {
    const res = await request(app).post("/login").send({
      email: "agus7@gmail.com",
      password: "agus123",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should return 400 if login credentials are invalid", async () => {
    const res = await request(app).post("/login").send({
      email: "monke@gmail.com",
      password: "1234",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Account not found");
  });

  it("should return 400 if some params are empty", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "", password: "12345678" });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "msg",
      "Parameter has null or invalid values"
    );
  });
});
