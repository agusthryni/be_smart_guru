const express = require("express");
const dotenv = require("dotenv");
const db = require("./config/db");
const openai = require("openai");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

dotenv.config();

const app = express();
const port = process.env.APP_PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/ping", (req, res) => {
  return res.send("Pong!");
});

app.post("/generate-course", async (req, res) => {
  const { grade, subject, subject_topic, questions_total, choices_total } =
    req.body;

  if (
    !grade ||
    !subject ||
    !subject_topic ||
    !questions_total ||
    !choices_total
  ) {
    let missingParams = [];
    if (!grade) missingParams.push("grade");
    if (!subject) missingParams.push("subject");
    if (!subject_topic) missingParams.push("subject_topic");
    if (!questions_total) missingParams.push("questions_total");
    if (!choices_total) missingParams.push("choices_total");

    return res
      .status(400)
      .json({ error: `Missing parameters: ${missingParams.join(", ")}` });
  }

  const prompt = `Create a multiple-choice quiz for the subject ${subject} with the topic ${subject_topic} for ${grade} high school grade consisting of ${questions_total} questions. Each question has ${choices_total} answer choices. The format JSON inside key named data and wrapped in an array with keys for questions, choices, and answers without alphabet to make it easy to parse. An example of the format is like this:
  [{"question":"the question here","choices":[{"content":"choice_1"},{"content":"choice_2"},{"content":"choice_3"}, and more...],"answer":{"content":"choice_x"}},{"question":"the question here","choices":[{"content":"choice_1"},{"content":"choice_2"},{"content":"choice_3"}, and more...],"answer":{"content":"choice_x"}}], please use the key name exactly as the example`;

  const ai = new openai({
    apiKey: process.env.OPENAI_KEY,
    dangerouslyAllowBrowser: true,
  });

  const result = await ai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 3000,
    response_format: { type: "json_object" },
  });

  try {
    const insertCourseQuery =
      "INSERT INTO courses(id_user, grade, subject, subject_topic, questions_total, choices_total) VALUES (?, ?, ?, ?, ?, ?)";
    const courseInsertionResult = await db.query(insertCourseQuery, [
      1,
      grade,
      subject,
      subject_topic,
      questions_total,
      choices_total,
    ]);

    const courseId = courseInsertionResult.insertId;

    const json_data = JSON.parse(result.choices[0].message.content);

    for (const data of json_data.data) {
      try {
        const insertQuestionQuery =
          "INSERT INTO Questions (question, id_course) VALUES (?, ?)";
        const questionInsertionResult = await db.query(insertQuestionQuery, [
          data.question,
          courseId,
        ]);

        const questionId = questionInsertionResult.insertId;

        for (const choice of data.choices) {
          const isCorrect = choice.content === data.answer.content;
          const insertChoiceQuery =
            "INSERT INTO Possible_Answers (id_question, answer_content, is_correct) VALUES (?, ?, ?)";
          await db.query(insertChoiceQuery, [
            questionId,
            choice.content,
            isCorrect,
          ]);
        }
      } catch (error) {
        return res.status(500).json({
          error: "Error inserting data",
        });
      }
    }

    res.send("Course generated successfully!");
  } catch (error) {
    return console.error("Error inserting data:", error);
  }
});

app.post("/parse-soal/:id_course", async (req, res) => {
  const { id_course } = req.params;
  const { json_soal } = req.body;
  const json_data = JSON.parse(json_soal);

  for (const data of json_data) {
    try {
      const insertQuestionQuery =
        "INSERT INTO Questions (question, id_course) VALUES (?, ?)";
      const questionInsertionResult = await db.query(insertQuestionQuery, [
        data.question,
        id_course,
      ]);

      const questionId = questionInsertionResult.insertId;

      for (const choice of data.choices) {
        const isCorrect = choice.content === data.answer.content;
        const insertChoiceQuery =
          "INSERT INTO Possible_Answers (id_question, answer_content, is_correct) VALUES (?, ?, ?)";
        await db.query(insertChoiceQuery, [
          questionId,
          choice.content,
          isCorrect,
        ]);
      }
    } catch (error) {
      console.error("Error inserting data:", error);
      return res.status(500).json({ error: "Error inserting data" });
    }
  }

  res.send("Data inserted successfully!");
});

app.get("/course/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the question and its possible answers from the database
    const questionQuery =
      "SELECT q.id, q.question, pa.id AS answer_id, pa.answer_content AS answer_content FROM Questions q LEFT JOIN Possible_Answers pa ON q.id = pa.id_question WHERE q.id_course = ?";
    const questions = await db.query(questionQuery, [id]);

    if (questions.length === 0) {
      return res
        .status(404)
        .json({ error: "Course not found or no questions available." });
    }

    // Group possible answers by question ID
    const questionsWithAnswers = questions.reduce((acc, question) => {
      if (!acc[question.id]) {
        acc[question.id] = {
          question: question.question,
          answers: [],
        };
      }

      if (question.answer_id) {
        acc[question.id].answers.push({
          id: question.answer_id,
          content: question.answer_content,
        });
      }

      return acc;
    }, {});

    // Render the question and possible answers as radio buttons
    const html = Object.values(questionsWithAnswers)
      .map((question) => {
        return `
                <h3>${question.question}</h3>
                ${question.answers
                  .map(
                    (answer) => `
                    <input type="radio" name="answers[${question.id}]" value="${answer.id}" id="answer-${answer.id}">
                    <label for="answer-${answer.id}">${answer.content}</label><br>
                `
                  )
                  .join("")}
            `;
      })
      .join("");

    // Add submit button
    const submitButtonHtml = `
            <form action="/submit-answers" method="POST">
                ${html}
                <button type="submit">Submit Answers</button>
            </form>
        `;

    res.send(submitButtonHtml);
  } catch (error) {
    console.error("Error fetching course questions:", error);
    res.status(500).json({ error: "Error fetching course questions." });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password, verify_password } = req.params;

  if (!name || !email || !password) {
    return res.status(400).json({
      msg: "Parameter has null or invalid values",
    });
  }

  if (password !== verify_password) {
    return res.status(400).json({
      msg: "Password doesn't match",
    });
  }

  const hashed_password = bcrypt
    .genSalt(process.env.SALT_ROUND)
    .then((salt) => {
      return bcrypt.hash(password, salt);
    });

  try {
    const registerQuery =
      "INSERT INTO users(name, email, password) VALUES(?, ?, ?)";
    const dbInsert = await db.query(registerQuery, [
      name,
      email,
      hashed_password,
    ]);

    if (dbInsert) {
      return res.status(200).json({
        msg: "Successfuly created the account",
      });
    } else {
      return res.status(500).json({
        msg: "Failed to register user",
      });
    }
  } catch (error) {
    return res.status(500).json({
      msg: "Failed to register user",
    });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.params;

  if (!email || !password) {
    return res.status(400).json({
      msg: "Parameter has null or invalid values",
    });
  }

  try {
    const loginQuery = "SELECT id, email, password FROM users WHERE email = ?";
    const dbSelect = db.query(loginQuery, [email]);

    if (dbSelect.length == 0) {
      return res.status(400).json({
        msg: "Account not found",
      });
    }

    if (dbSelect.length == 1) {
      if (bcrypt.compare(password, dbSelect[0]["password"])) {
        return res.status(200).json({
          msg: "Successfully logged in",
          token: jwt.sign(dbSelect[0], process.env.JWT_SECRET_KEY),
        });
      } else {
        return res.status(400).json({
          msg: "Password incorrect",
        });
      }
    } else {
      return res.status(400).json({
        msg: "Account not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      msg: "Unable to login",
    });
  }
});

app.listen(port, () => {
  console.log(`Aplikasi berjalan pada port ${port}`);
});
