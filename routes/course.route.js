const CourseController = require("../controllers/course.controller");
const router = require("express").Router();

router.get("/course/:id", CourseController.course);
router.get("/course/:id/detail", CourseController.courseDetail);
router.get("/course/test/:id", CourseController.courseTest);
router.get("/user/course/:id_user", CourseController.userCourse);
router.post("/submit/:id_user", CourseController.submit);
router.get("/course/:id_course/stats", CourseController.stats);
router.get("/course/:id_course/review", CourseController.review);
router.get("/answer/:id", CourseController.answer);

module.exports = router;
