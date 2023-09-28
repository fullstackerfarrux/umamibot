import axios from "axios";
import client from "../db/config.js";
import TelegramBot from "node-telegram-bot-api";

export const newsletter = async (req, res) => {
  let { images, videos, text } = req.body;
  const bot = new TelegramBot(process.env.TelegramApi);
  let token = process.env.TelegramApi;

  const getUser = await client.query("SELECT chat_id FROM users");

  for (let i = 0; i < getUser.rows.length; i++) {
    console.log(getUser.rows[i]);
    //   if (images == "" && videos == "") {
    //     bot.sendMessage(609736291, text);
    //   } else if (videos == "") {
    //     bot.sendPhoto(609736291, `${images[0]}`, {
    //       caption: `${text}`,
    //       parse_mode: "HTML",
    //     });
    //   } else if (images == "") {
    //     bot.sendVideo(609736291, `${videos[0]}`, {
    //       caption: `${text}`,
    //       parse_mode: "HTML",
    //     });
    //   } else {
    //     await bot.sendPhoto(609736291, `${images[0]}`);
    //     bot.sendVideo(609736291, `${videos[0]}`, {
    //       caption: `${text}`,
    //       parse_mode: "HTML",
    //     });
    //   }
  }

  return res.status(200).json({
    msg: "Created!",
  });
};
