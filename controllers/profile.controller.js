const db = require("../config/db");
const bcrypt = require("bcrypt");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();

exports.editProfile = async (req, res) => {
  const { id_user } = req.params;
  const { name, email, telp, address } = req.body;
  console.log("Change Profile");
  if (!name || !email) {
    return res.status(400).json({
      msg: "Parameter has null or invalid values",
    });
  }

  try {
    const userQuery = "SELECT id FROM users WHERE id = ?";
    const dbSelect = await db.query(userQuery, [id_user]);

    if (dbSelect.length === 0) {
      return res.status(400).json({
        msg: "Can't found user with that id",
      });
    }

    const profileQuery =
      "UPDATE users SET name = ?, email = ?, telephone = ?, address = ? WHERE id = ?";
    const dbInsert = await db.query(profileQuery, [
      name,
      email,
      telp,
      address,
      id_user,
    ]);

    if (dbInsert) {
      return res.status(200).json({
        msg: "Successfuly updated the profile",
      });
    } else {
      return res.status(500).json({
        msg: "Failed to update the profile",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Failed to update the profile",
    });
  }
};

exports.changePassword = async (req, res) => {
  const { id_user } = req.params;
  const { password, new_password, verify_password } = req.body;
  console.log("change password");
  if (!password || !new_password || !verify_password) {
    return res.status(400).json({
      msg: "Parameter has null or invalid values",
    });
  }

  if (new_password !== verify_password) {
    return res.status(400).json({
      msg: "Password doesn't match",
    });
  }

  try {
    const checkUserQuery = "SELECT id, password FROM users WHERE id = ?";
    const dbSelect = await db.query(checkUserQuery, [id_user]);

    if (dbSelect.length == 1) {
      if (await bcrypt.compare(password, dbSelect[0].password)) {
        const hashed_password = await bcrypt
          .genSalt(parseInt(process.env.SALT_ROUND))
          .then((salt) => {
            return bcrypt.hash(new_password, salt);
          });

        try {
          const changePasswordQuery =
            "UPDATE users SET password = ? WHERE  id = ?";
          const dbInsert = await db.query(changePasswordQuery, [
            hashed_password,
            id_user,
          ]);

          if (dbInsert) {
            return res.status(200).json({
              msg: "Successfuly update the password",
            });
          } else {
            return res.status(500).json({
              msg: "Failed update the password",
            });
          }
        } catch (error) {
          console.error(error);
          return res.status(500).json({
            msg: "Failed update the password",
          });
        }
      } else {
        return res.status(400).json({
          msg: "Password incorrect",
        });
      }
    } else {
      return res.status(400).json({
        msg: "Can't found user with that id",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Something went wrong when checking the user password",
    });
  }
};

exports.contactUs = async (req, res) => {
  const { email, problem, message } = req.body;
  console.log("Contact Us");
  if (!email || !problem || !message) {
    return res.status(400).json({
      msg: "Parameter has null or invalid values",
    });
  }

  try {
    const contactUsQuery =
      "INSERT INTO contact_us(email, problem, message) VALUES(?, ?, ?)";
    const dbInsert = await db.query(contactUsQuery, [email, problem, message]);

    if (dbInsert) {
      return res.status(200).json({
        msg: "Successfully sent your message",
      });
    } else {
      return res.status(500).json({
        msg: "Failed to send your message",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Failed to send your message",
    });
  }
};

exports.uploadProfilePhoto = async (req, res) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "..", "uploads"));
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const extension = file.originalname.split(".").pop();
      cb(null, uniqueSuffix + "." + extension);
    },
  });

  const upload = multer({ storage: storage }).single("profile_photo");

  upload(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        msg: "Failed to upload profile photo",
      });
    }

    const uploadedFile = req.file;
    const userId = req.body.user_id;

    try {
      const updateQuery = `UPDATE users SET image = ? WHERE id = ?`;
      const dbUpdate = await db.query(updateQuery, [
        uploadedFile.filename,
        userId,
      ]);

      if (dbUpdate) {
        return res.status(200).json({
          msg: "Profile photo uploaded successfully",
          photo_path: uploadedFile.path,
        });
      } else {
        return res.status(500).json({
          msg: "Failed to update user profile photo",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        msg: "Failed to update user profile photo",
      });
    }
  });
};
