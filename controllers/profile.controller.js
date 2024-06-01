const db = require("../config/db");
const bcrypt = require("bcrypt");

const { id_user } = req.params;

exports.editProfile = async (req, res) => {
  const { name, email, telp, address } = req.body;
  console.log("Change Profile");
  if (!name || !email || !telp || !address) {
    return res.status(400).json({
      msg: "Parameter has null or invalid values",
    });
  }

  try {
    const profileQuery =
      "UPDATE users SET name = ?, email = ?, telp = ?, address = ? WHERE id = ?";
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
    const changePasswordQuery = "UPDATE users SET password = ? WHERE  id = ?";
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
