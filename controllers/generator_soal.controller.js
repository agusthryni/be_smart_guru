const db = require("../config/db");
const openai = require("openai");

exports.generateCourse = async (req, res) => {
  const { id_user } = req.params;
  const {
    question_type,
    grade,
    subject,
    subject_topic,
    sub_subject_topic,
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
      .json({ msg: `Missing parameters: ${missingParams.join(", ")}` });
  }

  const prompt =
    `Saya seorang siswa yang sedang menempuh jenjang pendidikan sekolah menengah atas di Indonesia dengan menggunakan kurikulum merdeka. Saya ingin melakukan uji pemahaman dengan menggunakan metode latihan soal. Dalam sesi ini, saya ingin kamu berperan sebagai seorang ahli pendidikan yang sangat memahami seluk beluk pendidikan di Indonesia yang menerapkan kurikulum merdeka. Buat agar kumpulan soal tidak keluar dari topik dan jenjang pendidikan sekolah menengah atas. Berikan kumpulan soal ${question_type} untuk mata pelajaran ${subject} dengan topik ${subject_topic} ` +
    (sub_subject_topic ? `dan subtopiknya adalah ${sub_subject_topic}` : "") +
    ` untuk ${grade} SMA kurikulum merdeka yang terdiri dari ${questions_total}.Setiap pertanyaan memiliki ${choices_total} pilihan jawaban dan memiliki tepat satu jawaban benar. Saya ingin kamu memberikan kumpulan soal yang berkualitas dan berbobot. Narasikan soal untuk melatih literasi, analisa, dan proses berpikir kritis siswa dengan menggunakan bahasa indonesia terutama pada soal angka atau persamaan dinarasikan agar soal menjadi lebih kompleks. Buat dengan tingkat kompleksitas tinggi menggunakan standar olimpiade sains nasional. Format JSON di dalam kunci bernama data dan dibungkus dalam array dengan kunci untuk pertanyaan, pilihan, dan jawaban tanpa alfabet agar mudah diurai. Contoh formatnya seperti ini: [{"question":"pertanyaannya di sini","choices":[{"content":"choice_1"},{"content":"choice_2"},{"content" :"choice_3"}, dan masih banyak lagi...],"answer":{"content":"choice_x"}},{"question":"pertanyaannya di sini","choices":[{"content":" choice_1"},{"content":"choice_2"},{"content":"choice_3"}, dan banyak lagi...],"answer":{"content":"choice_x"}}], silakan gunakan nama kunci persis seperti contoh`;

  // `Saya seorang siswa yang sedang menempuh jenjang pendidikan sekolah menengah atas di Indonesia dengan menggunakan kurikulum merdeka. Saya ingin melakukan uji pemahaman dengan menggunakan metode latihan soal. Dalam sesi ini, saya ingin kamu berperan sebagai seorang ahli pendidikan yang sangat memahami seluk beluk pendidikan di Indonesia yang menerapkan kurikulum merdeka. Saya ingin kamu memberikan kumpulan soal yang berkualitas dan berbobot dilengkapi dengan narasi dan penjelasan jawaban benar secara detail dan spesifik ke saya. Buat agar kumpulan soal tidak keluar dari topik dan jenjang pendidikan sekolah menengah atas. Berikan kumpulan soal ${question_type} untuk mata pelajaran ${subject} dengan topik ${subject_topic} ` +
  // (sub_subject_topic ? `dan subtopiknya adalah ${sub_subject_topic}` : "") +
  // ` untuk ${grade} SMA kurikulum merdeka yang terdiri dari ${questions_total} soal dan format soal serta jawaban dalam flutter_tex HANYA jika mata pelajaran Matematika (Matematika), Fisika (Fisika) dan Kimia (Kimia). Setiap pertanyaan memiliki ${choices_total} pilihan jawaban dan memiliki tepat satu jawaban yang benar. Format JSON di dalam kunci bernama data dan dibungkus dalam array dengan kunci untuk pertanyaan, pilihan, dan jawaban tanpa alfabet agar mudah diurai. Contoh formatnya seperti ini: [{"question":"pertanyaannya di sini","choices":[{"content":"choice_1"},{"content":"choice_2"},{"content" :"choice_3"}, dan masih banyak lagi...],"answer":{"content":"choice_x"}},{"question":"pertanyaannya di sini","choices":[{"content":" choice_1"},{"content":"choice_2"},{"content":"choice_3"}, dan banyak lagi...],"answer":{"content":"choice_x"}}], silakan gunakan nama kunci persis seperti contoh`;

  // `Create a ${question_type} quiz for the subject ${subject} with the topic ${subject_topic} ` +
  //   (sub_subject_topic ? `and the subtopic is ${sub_subject_topic}` : "") +
  //   ` for ${grade} high school grade consisting of ${questions_total} questions and format the questions and answers in flutter_tex ONLY if the subject is Mathematics (Matematika), Physics (Fisika) and Chemistry (Kimia). Each question has ${choices_total} answer choices and has exactly one correct answer. The format JSON inside key named data and wrapped in an array with keys for questions, choices, and answers without alphabet to make it easy to parse. An example of the format is like this: [{"question":"the question here","choices":[{"content":"choice_1"},{"content":"choice_2"},{"content":"choice_3"}, and more...],"answer":{"content":"choice_x"}},{"question":"the question here","choices":[{"content":"choice_1"},{"content":"choice_2"},{"content":"choice_3"}, and more...],"answer":{"content":"choice_x"}}], please use the key name exactly as the example`;

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
      "INSERT INTO courses(id_user, grade, subject, subject_topic, sub_subject_topic, questions_total, choices_total) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const courseInsertionResult = await db.query(insertCourseQuery, [
      id_user,
      grade,
      subject,
      subject_topic,
      sub_subject_topic ? sub_subject_topic : null,
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
  } catch (error) {
    return console.error("Error inserting data:", error);
  }
};

exports.parseSoal = async (req, res) => {
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
