const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.APP_PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.get("/ping", (req, res) => {
  return res.send("Pong!");
});

const AuthRoutes = require("./routes/auth.route");
app.use("/", AuthRoutes);

const GeneratorCourseRoutes = require("./routes/generator_soal.route");
app.use("/", GeneratorCourseRoutes);

const CourseRoutes = require("./routes/course.route");
app.use("/", CourseRoutes);

const ProfileRoutes = require("./routes/profile.route");
app.use("/", ProfileRoutes);

app.listen(port, () => {
  console.log(`Aplikasi berjalan pada port ${port}`);
});
