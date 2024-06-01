const db = require("./config/db");

exports.course = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the question and its possible answers from the database
    const questionQuery =
      "SELECT q.id, q.question, pa.id AS answer_id, pa.answer_content AS answer_content FROM questions q LEFT JOIN possible_answers pa ON q.id = pa.id_question WHERE q.id_course = ?";
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
          id: question.id,
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

    res.status(200).json({
      msg: "Successfully get the question and answer",
      data: Object.values(questionsWithAnswers),
    });
    // console.log(questionsWithAnswers);
    // Object.values(questionsWithAnswers).map((question) => {
    //   console.log(question);
    // });
  } catch (error) {
    console.error("Error fetching course questions:", error);
    res.status(500).json({ error: "Error fetching course questions." });
  }
};

exports.courseTest = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the question and its possible answers from the database
    const questionQuery =
      "SELECT q.id, q.question, pa.id AS answer_id, pa.answer_content AS answer_content FROM questions q LEFT JOIN Possible_Answers pa ON q.id = pa.id_question WHERE q.id_course = ?";
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
};

exports.userCourse = async (req, res) => {
  const { id_user } = req.params;

  try {
    const courseQuery = "SELECT * FROM courses WHERE id_user = ?";
    const courses = await db.query(courseQuery, [id_user]);

    if (courses.length === 0) {
      return res
        .status(404)
        .json({ error: "Course not found or no courses available." });
    } else if (courses.length >= 1) {
      return res.status(200).json({ data: courses });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching course questions." });
  }
};
