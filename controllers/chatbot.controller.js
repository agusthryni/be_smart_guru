const dotenv = require("dotenv");
const openai = require("openai");
dotenv.config();

exports.chat = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      msg: "Message is required",
    });
  }

  try {
    const prompt =
      "Kamu adalah seorang yang ahli dalam akademik, kamu akan ditanyai hal seputar mata pelajaran sekolah menengah atas kelas 10 sampai dengan 12. Jawablah pertanyaan berikut dengan penjelasan yang mudah : ${message}.";
    const ai = new openai({
      apiKey: process.env.OPENAI_KEY,
      dangerouslyAllowBrowser: true,
    });

    const result = await ai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
    });

    answer = result.choices[0].message.content;

    return res.status(200).json({
      msg: "Successfully get answer from OpenAI",
      answer: answer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Failed to fetch response from OpenAI",
    });
  }
};
