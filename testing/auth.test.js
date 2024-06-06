const request = require("supertest");
const app = "http://besg-test.panti.my.id";
function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const randomEmail = makeid(5);
var userId;

describe("Endpoint Register", () => {
  it("Berhasil mendaftar akun baru dengan data valid [200]", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        name: randomEmail,
        email: `${randomEmail}@gmail.com`,
        password: "agus123",
        verify_password: "agus123",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("msg", "Successfuly created the account");
    userId = res.body.user_id;
  });

  it("Gagal mendaftar akun baru karena password yang berbeda dengan konfirmasi password [400]", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        name: randomEmail,
        email: `${randomEmail}@gmail.com`,
        password: "agus123",
        verify_password: "differentpassword",
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Password doesn't match");
  });

  it("Gagal mendaftar akun baru karena beberapa argumen dikosongkan [400]", async () => {
    const res = await request(app)
      .post("/register")
      .send({
        name: "",
        email: `${randomEmail}@gmail.com`,
        password: "agus123",
        verify_password: "agus123",
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "msg",
      "Parameter has null or invalid values"
    );
  });
});

describe("Endpoint Login", () => {
  it("Berhasil masuk kedalam akun dengan data valid [200]", async () => {
    const res = await request(app)
      .post("/login")
      .send({
        email: `${randomEmail}@gmail.com`,
        password: "agus123",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });

  it("Gagal masuk kedalam akun dengan password yang salah [400]", async () => {
    const res = await request(app)
      .post("/login")
      .send({
        email: `${randomEmail}@gmail.com`,
        password: "1234",
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Password incorrect");
  });

  it("Gagal masuk kedalam akun karena data tidak valid [400]", async () => {
    const res = await request(app).post("/login").send({
      email: "example@gmail.com",
      password: "1234",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Account not found");
  });

  it("Gagal masuk kedalam akun karena beberapa argumen dikosongkan [400]", async () => {
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
