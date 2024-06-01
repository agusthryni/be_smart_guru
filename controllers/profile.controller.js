const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.editProfile = async (req, res) => {
  const { name, email, telp, address } = req.body;
  console.log("change profile");
  if (!name || !email || !telp || !address) {
    return res.status(400).json({
      msg: "Parameter has null or invalid values",
    });
  }

  try {
    const profileQuery =
      "UPDATE INTO users(name, email, telp, address) VALUES(?, ?, ?)";
    const dbInsert = await db.query(profileQuery, [name, email, telp, address]);

    if (dbInsert) {
      return res.status(200).json({
        msg: "Successfuly update the profile",
      });
    } else {
      return res.status(500).json({
        msg: "Failed update the profile",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Failed update the profile",
    });
  }
};

exports.changePassword = async (req, res) => {
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

  const hashed_password = await bcrypt
    .genSalt(parseInt(process.env.SALT_ROUND))
    .then((salt) => {
      return bcrypt.hash(new_password, salt);
    });

  try {
    const changePasswordQuery =
      "UPDATE INTO users(password, new_password, verify_password) VALUES(?, ?, ?)";
    const dbInsert = await db.query(changePasswordQuery, [
      password,
      hashed_password,
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
};
