import axios from "axios";
import client from "../db/config.js";
import TelegramBot from "node-telegram-bot-api";

export const newsletter = async (req, res) => {
  let { images, text } = req.body;
  const bot = new TelegramBot(process.env.TelegramApi);
  let token = process.env.TelegramApi;

  if (text == "" || text == undefined) {
    return res.status(400).json({
      msg: "text 404",
    });
  }

  const getUser = await client.query("SELECT chat_id FROM users");

  for (let i = 0; i < getUser.rows.length; i++) {
    console.log(getUser.rows[i].chat_id);
    await bot.sendPhoto(609736291, `${images[0]}`, {
      caption: `${text}`,
      parse_mode: "HTML",
    });
  }

  return res.status(200).json({
    msg: "Created!",
  });
};
