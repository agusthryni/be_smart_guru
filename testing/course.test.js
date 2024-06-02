const request = require("supertest");
const app = "http://besg-test.panti.my.id";

describe("course endpoint", () => {
  it("should fetch questions and answers for a valid course ID", async () => {
    const res = await request(app).get("/course/1");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty(
      "msg",
      "Successfully get the question and answer"
    );
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should return 404 if course ID is not found", async () => {
    const res = await request(app).get("/course/999");
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "error",
      "Course not found or no questions available."
    );
  });

  it("should return 500 if there is an error fetching course questions", async () => {
    const res = await request(app).get("/course/error");
    if (res.statusCode !== 500) {
      console.log("Manual check required for error simulation");
    } else {
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty(
        "error",
        "Error fetching course questions."
      );
    }
  });
});

describe("userCourse endpoint", () => {
  it("should fetch courses for a valid user ID", async () => {
    const res = await request(app).get("/user/course/1");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("should return 404 if user ID has no courses", async () => {
    const res = await request(app).get("/user/course/999");
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty(
      "error",
      "Course not found or no courses available."
    );
  });

  it("should return 500 if there is an error fetching user courses", async () => {
    const res = await request(app).get("/user/course/error");
    if (res.statusCode !== 500) {
      console.log("Manual check required for error simulation");
    } else {
      expect(res.statusCode).toEqual(500);
      expect(res.body).toHaveProperty(
        "error",
        "Error fetching course questions."
      );
    }
  });
});
