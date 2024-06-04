const ProfileController = require("../controllers/profile.controller");
const router = require("express").Router();

router.put("/user/edit/:id_user", ProfileController.editProfile);
router.put("/user/change_password/:id_user", ProfileController.changePassword);
router.post("/user/contact_us", ProfileController.contactUs);
router.post(
  "/user/upload-profile-photo",
  upload,
  ProfileController.uploadProfilePhoto
);

module.exports = router;
