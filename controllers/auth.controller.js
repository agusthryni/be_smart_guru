const db = require("../config/db");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.register = async (req, res) => {
  const { name, email, password, verify_password } = req.body;
  console.log("register");
  if (!name || !email || !password || !verify_password) {
    return res.status(400).json({
      msg: "Parameter has null or invalid values",
    });
  }

  if (password !== verify_password) {
    return res.status(400).json({
      msg: "Password doesn't match",
    });
  }

  const hashed_password = await bcrypt
    .genSalt(parseInt(process.env.SALT_ROUND))
    .then((salt) => {
      return bcrypt.hash(password, salt);
    });

  try {
    const registerQuery =
      "INSERT INTO users(name, email, password) VALUES(?, ?, ?)";
    const dbInsert = await db.query(registerQuery, [
      name,
      email,
      hashed_password,
    ]);

    if (dbInsert) {
      return res.status(200).json({
        msg: "Successfuly created the account",
        user_id: dbInsert.insertId,
      });
    } else {
      return res.status(500).json({
        msg: "Failed to register user",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Failed to register user",
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("login");

  if (!email || !password) {
    return res.status(400).json({
      msg: "Parameter has null or invalid values",
    });
  }

  try {
    const loginQuery =
      "SELECT id, name, email, password, telephone, address, image FROM users WHERE email = ?";
    const dbSelect = await db.query(loginQuery, [email]);

    if (dbSelect.length == 0) {
      return res.status(400).json({
        msg: "Account not found",
      });
    }

    if (dbSelect.length == 1) {
      if (await bcrypt.compare(password, dbSelect[0].password)) {
        return res.status(200).json({
          msg: "Successfully logged in",
          token: jwt.sign(dbSelect[0], process.env.JWT_SECRET_KEY),
        });
      } else {
        return res.status(400).json({
          msg: "Password incorrect",
        });
      }
    } else {
      return res.status(400).json({
        msg: "Account not found",
      });
    }
  } catch (error) {
    return res.status(500).json({
      msg: "Unable to login",
    });
  }
};
