const db = require("./config/db");
const openai = require("openai");

exports.generateCourse = async (req, res) => {
  const { id_user } = req.params;
  const {
    question_type,
    grade,
    subject,
    subject_topic,
    questions_total,
    choices_total,
  } = req.body;

  if (
    !question_type ||
    !grade ||
    !subject ||
    !subject_topic ||
    !questions_total ||
    !choices_total
  ) {
    let missingParams = [];
    if (!question_type) missingParams.push("question_type");
    if (!grade) missingParams.push("grade");
    if (!subject) missingParams.push("subject");
    if (!subject_topic) missingParams.push("subject_topic");
    if (!questions_total) missingParams.push("questions_total");
    if (!choices_total) missingParams.push("choices_total");

    return res
      .status(400)
      .json({ error: `Missing parameters: ${missingParams.join(", ")}` });
  }

  const prompt = `Create a ${question_type} quiz for the subject ${subject} with the topic ${subject_topic} for ${grade} high school grade consisting of ${questions_total} questions. Each question has ${choices_total} answer choices. The format JSON inside key named data and wrapped in an array with keys for questions, choices, and answers without alphabet to make it easy to parse. An example of the format is like this:
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
      id_user,
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
          "INSERT INTO questions (question, id_course) VALUES (?, ?)";
        const questionInsertionResult = await db.query(insertQuestionQuery, [
          data.question,
          courseId,
        ]);

        const questionId = questionInsertionResult.insertId;

        for (const choice of data.choices) {
          const isCorrect = choice.content === data.answer.content;
          const insertChoiceQuery =
            "INSERT INTO possible_answers (id_question, answer_content, is_correct) VALUES (?, ?, ?)";
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

    return res.status(200).json({
      msg: "Generated successfully",
      course_id: courseId,
    });
    // res.send("Course generated successfully!");
  } catch (error) {
    return console.error("Error inserting data:", error);
  }
};

exports.parseSoal,
  async (req, res) => {
    const { id_course } = req.params;
    const { json_soal } = req.body;
    const json_data = JSON.parse(json_soal);

    for (const data of json_data) {
      try {
        const insertQuestionQuery =
          "INSERT INTO questions (question, id_course) VALUES (?, ?)";
        const questionInsertionResult = await db.query(insertQuestionQuery, [
          data.question,
          id_course,
        ]);

        const questionId = questionInsertionResult.insertId;

        for (const choice of data.choices) {
          const isCorrect = choice.content === data.answer.content;
          const insertChoiceQuery =
            "INSERT INTO possible_answers (id_question, answer_content, is_correct) VALUES (?, ?, ?)";
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
  };
