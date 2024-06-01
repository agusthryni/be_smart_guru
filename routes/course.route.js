const CourseController = require("../controllers/course.controller");
const router = require("express").Router();

router.get("/course/:id", CourseController.course);
router.get("/course/test/:id", CourseController.courseTest);
router.get("/user/course/:id_user", CourseController.userCourse);

module.exports = router;
