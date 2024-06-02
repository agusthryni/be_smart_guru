const request = require("supertest");
const app = "http://besg-test.panti.my.id";

describe("editProfile endpoint", () => {
  it("should update profile for a valid user ID", async () => {
    const res = await request(app).put("/user/edit/1").send({
      name: "Agus",
      email: "agus7@gmail.com",
      telp: "123456789",
      address: "Balikpapan",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("msg", "Successfuly updated the profile");
  });

  it("should return 400 if required parameters are missing", async () => {
    const res = await request(app).put("/user/edit/1").send({
      email: "agus7@gmail.com",
      telp: "123456789",
      address: "123 Main Street",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "msg",
      "Parameter has null or invalid values"
    );
  });
});

describe("changePassword endpoint", () => {
  it("should change password for a valid user ID", async () => {
    const res = await request(app).put("/user/change_password/1").send({
      password: "agus123",
      new_password: "new_password",
      verify_password: "new_password",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("msg", "Successfuly update the password");
  });

  it("should return 400 if passwords do not match", async () => {
    const res = await request(app).put("/user/change_password/1").send({
      password: "agus123",
      new_password: "new_password",
      verify_password: "wrong_password",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Password doesn't match");
  });

  it("should return 400 if required parameters are missing", async () => {
    const res = await request(app).put("/user/change_password/1").send({
      new_password: "new_password",
      verify_password: "new_password",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "msg",
      "Parameter has null or invalid values"
    );
  });
});

describe("contactUs endpoint", () => {
  it("should send message with valid parameters", async () => {
    const res = await request(app).post("/user/contact_us").send({
      email: "agus7@gmail.com",
      problem: "Technical issue",
      message: "I'm having trouble with the login process.",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("msg", "Successfully sent your message");
  });

  it("should return 400 if required parameters are missing", async () => {
    const res = await request(app).post("/user/contact_us").send({
      problem: "Technical issue",
      message: "I'm having trouble with the login process.",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "msg",
      "Parameter has null or invalid values"
    );
  });
});
