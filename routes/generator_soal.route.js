const generatorSoalController = require("../controllers/generator_soal.controller");
const router = require("express").Router();

router.post(
  "/generate-course/:id_user",
  generatorSoalController.generateCourse
);
router.post("/parse-soal/:id_course", generatorSoalController.parseSoal);

module.exports = router;
