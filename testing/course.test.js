const request = require("supertest");
const app = "http://besg-test.panti.my.id";
var courseId;
var courseQuestions;

function generateRandomAnswers(data) {
  return data.data.map((question) => {
    const randomAnswer =
      question.answers[Math.floor(Math.random() * question.answers.length)];
    return {
      id: question.id,
      answerId: randomAnswer.id,
    };
  });
}

describe("Endpoint Generate Course", () => {
  it(
    "Berhasil generate pertanyaan dan jawaban dengan data valid [200]",
    async () => {
      const res = await request(app).post("/generate-course/1").send({
        question_type: "Pilihan Ganda",
        grade: "12",
        subject: "Matematika",
        subject_topic: "Kombinatorik",
        questions_total: "5",
        choices_total: "3",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("msg", "Generated successfully");
      courseId = res.body.course_id;
    },
    60 * 1000
  );

  it("Gagal generate pertanyaan dan jawaban dengan beberapa argumen dikosongkan [400]", async () => {
    const res = await request(app).post("/generate-course/1").send({
      question_type: "",
      grade: "12",
      subject: "Matematika",
      subject_topic: "Kombinatorik",
      questions_total: "5",
      choices_total: "3",
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Missing parameters: question_type");
  });
});

describe("Endpoint Course", () => {
  it("Berhasil mendapatkan data course dengan ID valid [200]", async () => {
    const res = await request(app).get(`/course/${courseId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      "msg",
      "Successfully get the question and answer"
    );
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);

    courseQuestions = res.body;
  });

  it("Gagal mendapatkan data course dengan ID tidak valid [400]", async () => {
    const res = await request(app).get("/course/999");
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "msg",
      "Course not found or no questions available."
    );
  });

  it("Berhasil submit data jawaban dengan ID user, ID course dan jawaban yang valid [200]", async () => {
    const res = await request(app)
      .post(`/submit/1`)
      .send({
        id_course: courseId,
        answers: generateRandomAnswers(courseQuestions),
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("msg", "Answers submitted successfully");
    expect(res.body).toHaveProperty("score");
  });

  it("Gagal submit data jawaban dengan ID user yang tidak valid [400]", async () => {
    const res = await request(app)
      .post(`/submit/999`)
      .send({
        id_course: courseId,
        answers: generateRandomAnswers(courseQuestions),
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Can't found user with that id");
  });

  it("Gagal submit data jawaban dengan ID course yang tidak valid [400]", async () => {
    const res = await request(app)
      .post(`/submit/1`)
      .send({
        id_course: 999999,
        answers: generateRandomAnswers(courseQuestions),
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Course not found.");
  });

  it("Gagal submit data jawaban dengan beberapa argumen kosong [400]", async () => {
    const res = await request(app).post(`/submit/1`).send({
      id_course: courseId,
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "msg",
      "Invalid data format or empty answers array"
    );
  });

  it("Berhasil mendapatkan detail data course dengan ID valid [200]", async () => {
    const res = await request(app).get(`/course/${courseId}/detail`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("msg", "Successfully get course detail");
    expect(res.body).toHaveProperty("data");
  });

  it("Gagal mendapatkan detail data course dengan ID tidak valid [400]", async () => {
    const res = await request(app).get(`/course/999/detail`);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Course not found");
  });
});

describe("Course User Endpoint", () => {
  it("Berhasil mendapatkan course - course yang dimiliki oleh user dengan ID yang valid [200]", async () => {
    const res = await request(app).get("/user/course/1");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("msg", "Successfully get user courses");
  });

  it("Gagal mendapatkan course - course yang dimiliki oleh user dengan ID yang tidak valid [400]", async () => {
    const res = await request(app).get("/user/course/999");
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty(
      "msg",
      "User course not found or no courses available."
    );
  });
});

describe("Endpoint Course Stats", () => {
  it("Berhasil mendapatkan statistik course dengan ID valid [200]", async () => {
    const res = await request(app).get(`/course/${courseId}/stats`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      "msg",
      "Successfully get course statistics"
    );
  });

  it("Gagal mendapatkan statistik course dengan ID tidak valid [500]", async () => {
    const res = await request(app).get("/course/999/stats");
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("msg", "Course not found.");
  });
});
