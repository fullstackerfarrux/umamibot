import axios from "axios";
import client from "../db/config.js";
import TelegramBot from "node-telegram-bot-api";

export const newsletter = async (req, res) => {
  let { images, videos, text } = req.body;
  const bot = new TelegramBot(process.env.TelegramApi);
  let token = process.env.TelegramApi;

  const getUser = await client.query("SELECT chat_id FROM users");

  for (let i = 0; i < getUser.rows.length; i++) {
    if (images == "" && videos == "") {
      bot.sendMessage(getUser.rows[i].chat_id, text, {
        reply_markup: JSON.stringify({
          keyboard: [
            [{ text: "Отправить геопозицию", request_location: true }],
          ],
          resize_keyboard: true,
        }),
      });
    } else if (videos == "") {
      bot.sendPhoto(getUser.rows[i].chat_id, `${images[0]}`, {
        caption: `${text}`,
        parse_mode: "HTML",
        reply_markup: JSON.stringify({
          keyboard: [
            [{ text: "Отправить геопозицию", request_location: true }],
          ],
          resize_keyboard: true,
        }),
      });
    } else if (images == "") {
      bot.sendVideo(getUser.rows[i].chat_id, `${videos[0]}`, {
        caption: `${text}`,
        parse_mode: "HTML",
        reply_markup: JSON.stringify({
          keyboard: [
            [{ text: "Отправить геопозицию", request_location: true }],
          ],
          resize_keyboard: true,
        }),
      });
    } else {
      await bot.sendPhoto(getUser.rows[i].chat_id, `${images[0]}`);
      bot.sendVideo(getUser.rows[i].chat_id, `${videos[0]}`, {
        caption: `${text}`,
        parse_mode: "HTML",
        reply_markup: JSON.stringify({
          keyboard: [
            [{ text: "Отправить геопозицию", request_location: true }],
          ],
          resize_keyboard: true,
        }),
      });
    }
  }

  return res.status(200).json({
    msg: "Created!",
  });
};
