import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  let { username, password } = req.body;
  const correctUsername = process.env.ADMIN_USERNAME;
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (username == correctUsername && password == correctPassword) {
    let token = jwt.sign(
      { id: "46a1166c-77a3-422f-9f6c-b09758117ea5" },
      process.env.SECRET_KEY,
      {
        expiresIn: "48h",
      }
    );

    return res.status(200).send({
      msg: "Login succes!!",
      token,
    });
  } else {
    return res.status(400).send({
      msg: "Bad Request",
    });
  }
};
