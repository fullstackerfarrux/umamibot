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

  for (let i = 0; i < getUser.rows.length; i++) {
    axios.post(
      `https://api.telegram.org/bot${token}/sendMessage?chat_id=${getUser.rows[i].chat_id}&parse_mode=html&text=${text}`
    );
  }

  return res.status(200).json({
    msg: "Created!",
  });
};
