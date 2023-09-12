import axios from "axios";
import client from "../db/config.js";

export const newsletter = async (req, res) => {
  let { images, text } = req.body;
  let token = process.env.TelegramApi;

  if (text == "" || text == undefined) {
    return res.status(400).json({
      msg: "text 404",
    });
  }

  const getUser = await client.query("SELECT chat_id FROM users");

  console.log(getUser.rows);

  for (let i = 0; i < getUser.rows.length; i++) {
    axios.post(
      `https://api.telegram.org/bot${token}/sendMessage?chat_id=${getUser.rows[i]}&parse_mode=html&text=${message}`
    );
  }

  return res.status(200).json({
    msg: "Created!",
  });
};
