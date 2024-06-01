const ProfileController = require("../controllers/profile.controller");
const router = require("express").Router();

router.put("/user/edit", ProfileController.editProfile);
router.put("/user/change_password", ProfileController.changePassword);

module.exports = router;
