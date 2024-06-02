const db = require("../config/db");

exports.course = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the question and its possible answers from the database
    const questionQuery =
      "SELECT q.id, q.question, pa.id AS answer_id, pa.answer_content AS answer_content FROM questions q LEFT JOIN possible_answers pa ON q.id = pa.id_question WHERE q.id_course = ?";
    const questions = await db.query(questionQuery, [id]);

    if (questions.length === 0) {
      return res
        .status(400)
        .json({ msg: "Course not found or no questions available." });
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

exports.courseDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const courseDetailQuery =
      "SELECT c.id, c.grade, c.subject, c.subject_topic, c.questions_total FROM courses c WHERE c.id = ?";
    const courseDetail = await db.query(courseDetailQuery, [id]);

    if (courseDetail.length === 0) {
      return res.status(400).json({ msg: "Course not found" });
    }

    return res.status(200).json({
      msg: "Successfully get course detail",
      data: courseDetail[0],
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Something went wrong when trying to get course details",
    });
  }
};

exports.courseTest = async (req, res) => {
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
    const courseQuery = "SELECT * FROM courses WHERE id_user = ? ORDER BY id DESC";
    const courses = await db.query(courseQuery, [id_user]);

    if (courses.length === 0) {
      return res
        .status(400)
        .json({ msg: "User course not found or no courses available." });
    } else if (courses.length >= 1) {
      return res.status(200).json({
        msg: "Successfully get user courses",
        data: courses,
      });
    }
  } catch (error) {
    res.status(500).json({ msg: "Error fetching course questions." });
  }
};

exports.submit = async (req, res) => {
  const { id_user } = req.params;
  var { id_course, answers } = req.body;

  if (!id_course || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({
      msg: "Invalid data format or empty answers array",
    });
  }

  try {
    for (const answer of answers) {
      const { id, answerId } = answer;
      const query = `
          INSERT INTO user_answers (id_user, id_question, id_answer)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE id_answer = VALUES(id_answer)
        `;

      await db.query(query, [id_user, id, answerId || null]);
    }

    // Calculate score out of 100
    const totalQuestionsQuery = `
        SELECT COUNT(*) AS total_questions
        FROM user_answers
        WHERE id_user = ? AND id_question IN (SELECT id_question FROM user_answers WHERE id_user = ?)
      `;
    const [totalQuestionsRows] = await db.query(totalQuestionsQuery, [
      id_user,
      id_user,
    ]);
    const totalQuestions = totalQuestionsRows.total_questions || 0;

    const correctAnswersQuery = `
        SELECT COUNT(*) AS correct_answers
        FROM user_answers ua
        INNER JOIN possible_answers pa ON ua.id_answer = pa.id
        WHERE ua.id_user = ? AND pa.is_correct = 1
      `;
    const [correctAnswersRows] = await db.query(correctAnswersQuery, [id_user]);
    const correctAnswers = correctAnswersRows.correct_answers || 0;

    const score =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Update courses table
    const updateQuery = `
        UPDATE courses SET score = ? WHERE id = ?
      `;
    await db.query(updateQuery, [score, id_course]);

    return res.status(200).json({
      msg: "Answers submitted successfully",
      score: score,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Failed to submit answers",
    });
  }
};

exports.stats = async (req, res) => {
  const { id_course } = req.params;

  try {
    // Fetch total questions for the course
    const totalQuestionsQuery = `
      SELECT COUNT(*) as total_questions 
      FROM questions 
      WHERE id_course = ?
    `;
    const [totalQuestionsResult] = await db.query(totalQuestionsQuery, [id_course]);
    const totalQuestions = totalQuestionsResult.total_questions;

    // Fetch total correct answers for the course
    const totalCorrectAnswersQuery = `
      SELECT COUNT(*) as total_correct_answers
      FROM user_answers ua
      JOIN possible_answers pa ON ua.id_answer = pa.id
      JOIN questions q ON ua.id_question = q.id
      WHERE q.id_course = ? AND pa.is_correct = 1
    `;
    const [totalCorrectAnswersResult] = await db.query(totalCorrectAnswersQuery, [id_course]);
    const totalCorrectAnswers = totalCorrectAnswersResult.total_correct_answers;

    // Calculate total wrong answers
    const totalWrongAnswers = totalQuestions - totalCorrectAnswers;

    // Calculate total answered questions
    const totalAnsweredQuestionsQuery = `
      SELECT COUNT(DISTINCT id_question) as total_answered_questions
      FROM user_answers ua
      JOIN questions q ON ua.id_question = q.id
      WHERE q.id_course = ?
    `;
    const [totalAnsweredQuestionsResult] = await db.query(totalAnsweredQuestionsQuery, [id_course]);
    const totalAnsweredQuestions = totalAnsweredQuestionsResult.total_answered_questions;

    // Calculate total not answered questions
    const totalNotAnsweredQuestions = totalQuestions - totalAnsweredQuestions;

    // Calculate score out of 100
    const score = (totalCorrectAnswers / totalQuestions) * 100;

    return res.status(200).json({
      msg: "Successfully get course statistics",
      score: score,
      total_questions: totalQuestions,
      total_correct: totalCorrectAnswers,
      total_wrong: totalWrongAnswers,
      total_not_answered: totalNotAnsweredQuestions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Failed to fetch course statistics",
    });
  }
};
