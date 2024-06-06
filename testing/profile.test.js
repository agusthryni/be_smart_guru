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

describe("Endpoint Edit User", () => {
  it("Berhasil mengubah data user dengan ID user yang valid [200]", async () => {
    const res = await request(app)
      .put(`/user/edit/${userId}`)
      .send({
        name: randomEmail,
        email: `${randomEmail}@gmail.com`,
        telp: Math.floor(Math.random() * 1000000000),
        address: "Balikpapan",
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("msg", "Successfuly updated the profile");
  });

  it("Gagal mengubah data user dengan ID user yang tidak valid [400]", async () => {
    const res = await request(app)
      .put(`/user/edit/999`)
      .send({
        name: makeid(5),
        email: `${makeid(5)}@gmail.com`,
        telp: "123456789",
        address: "123 Main Street",
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Can't found user with that id");
  });

  it("Gagal mengubah data user dengan beberapa argumen dikosongkan [400]", async () => {
    const res = await request(app)
      .put(`/user/edit/${userId}`)
      .send({
        name: "",
        email: `${randomEmail}@gmail.com`,
        telp: "123456789",
        address: "123 Main Street",
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "msg",
      "Parameter has null or invalid values"
    );
  });

  it("Berhasil mengubah password user dengan ID user yang valid [200]", async () => {
    const res = await request(app).put(`/user/change_password/${userId}`).send({
      password: "agus123",
      new_password: "new_password",
      verify_password: "new_password",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("msg", "Successfuly update the password");
  });

  it("Gagal mengubah password user karena password user salah [400]", async () => {
    const res = await request(app).put(`/user/change_password/${userId}`).send({
      password: "salah",
      new_password: "new_password",
      verify_password: "new_password",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Password incorrect");
  });

  it("Gagal mengubah password user karena password baru tidak sama dengan konfirmasi password [400]", async () => {
    const res = await request(app).put(`/user/change_password/${userId}`).send({
      password: "agus123",
      new_password: "new_password",
      verify_password: "wrong_password",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Password doesn't match");
  });

  it("Gagal mengubah password user karena beberapa argumen dikosongkan [400]", async () => {
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

  it("Berhasil mengubah foto profil user dengan ID yang valid dan foto file terupload [200]", async () => {
    const res = await request(app)
      .post("/user/upload_profile_photo/1")
      .attach("profile_photo", "./testing/assets/image.png");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      "msg",
      "Profile photo uploaded successfully"
    );
  });

  it("Gagal mengubah foto profil user dengan ID yang tidak valid [400]", async () => {
    const res = await request(app)
      .post("/user/upload_profile_photo/999")
      .attach("profile_photo", "./testing/assets/image.png");
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Can't found user with that id");
  });

  it("Gagal mengubah foto profil user dengan ID valid tetapi bukan file gambar [400]", async () => {
    const res = await request(app)
      .post("/user/upload_profile_photo/1")
      .attach("profile_photo", "./testing/course.test.js");
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "msg",
      "Invalid file type. Only images are allowed."
    );
  });
});

describe("Endpoint Contact Us", () => {
  it("Berhasil mengirim pesan dengan data valid [200]", async () => {
    const res = await request(app).post("/user/contact_us").send({
      email: "agus7@gmail.com",
      problem: "Technical issue",
      message: "I'm having trouble with the login process.",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("msg", "Successfully sent your message");
  });

  it("Gagal mengirim pesan karena beberapa argumen dikosongkan [400]", async () => {
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
