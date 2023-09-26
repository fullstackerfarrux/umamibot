import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import client from "./db/config.js";
import loginRoute from "./Router/login.route.js";
import productRoute from "./Router/products.route.js";
import categoryRoute from "./Router/category.route.js";
import ordersRoute from "./Router/orders.route.js";
import userRoute from "./Router/user.route.js";
import bannerRoute from "./Router/banner.route.js";
import promoRoute from "./Router/promocode.route.js";
import newsletterRoute from "./Router/newsletter.route.js";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

let port = process.env.PORT || 4001;
const bot = new TelegramBot(process.env.TelegramApi, { polling: true });

bot.onText(/start/, async (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Здравствуйте ${msg.chat.first_name}!
       Добро пожаловать! Я официальный бот Umami Sushi.
       Здесь можно посмотреть меню и заказать на дом!`,
    {
      reply_markup: JSON.stringify({
        keyboard: [[{ text: "Отправить контакт", request_contact: true }]],
        resize_keyboard: true,
      }),
    }
  );
});

bot.on("contact", async (msg) => {
  console.log(msg);
  const find = await client.query(
    "select * from users where phone_number = $1",
    [msg.contact.phone_number]
  );

  console.log("find", find);

  if (find.rowCount == 0) {
    let username = msg.chat.username !== null ? msg.chat.username : "";

    const create = await client.query(
      "INSERT INTO users(user_id, chat_id, username, firstname, phone_number) values($1, $2, $3, $4, $5)",
      [
        msg.from.id,
        msg.chat.id,
        username,
        msg.contact.first_name,
        msg.contact.phone_number,
      ]
    );

    console.log(create);

    bot.sendMessage(msg.chat.id, `Пожалуйста отправьте геопозицию`, {
      reply_markup: JSON.stringify({
        keyboard: [[{ text: "Отправить геопозицию", request_location: true }]],
        resize_keyboard: true,
      }),
    });

    console.log("geolocation soradi");
  } else {
    bot.sendMessage(msg.chat.id, `Пожалуйста отправьте геопозицию`, {
      reply_markup: JSON.stringify({
        keyboard: [[{ text: "Отправить геопозицию", request_location: true }]],
        resize_keyboard: true,
      }),
    });
  }
});

bot.on("location", async (msg) => {
  let { latitude, longitude } = msg.location;
  const location = [latitude, longitude];

  let locationString = "";
  let data = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
  )
    .then((res) => res.json())
    .then(
      (data) =>
        (locationString = `${data.address?.city}, ${data.address?.county}, ${data.address?.road}`)
    );

  const update = await client.query(
    "UPDATE users SET user_location = $1, reverse_location = $2 WHERE user_id = $3",
    [location, locationString, msg.from.id]
  );

  bot.sendMessage(msg.chat.id, ` Для выбора товара нажмите на кнопку "Меню"`, {
    reply_markup: JSON.stringify({
      keyboard: [
        [
          {
            text: `Меню`,
            web_app: { url: `https://umamisushi.vercel.app/${msg.from.id}` },
          },
        ],
      ],
      resize_keyboard: true,
    }),
  });
});

bot.on("message", async (msg) => {
  if (msg.web_app_data?.data) {
    try {
      const data = JSON.parse(msg.web_app_data.data);
      if (msg.web_app_data.data.length >= 0) {
        let user = await client.query(
          "SELECT * FROM users where user_id = $1",
          [msg.from.id]
        );

        if (data.payment !== "РауМе") {
          let create = await client.query(
            "INSERT INTO orders(products, total, user_id, username, phone_number, comment, payment_type, exportation) values($1, $2, $3, $4, $5, $6, $7, $8)",
            [
              data.order_products,
              `${data.total}`,
              msg.from.id,
              msg.from.first_name,
              user.rows[0].phone_number,
              data.comment,
              data.payment,
              data.delivery,
            ]
          );
        }

        if (data.promocode !== "") {
          let getPromo = await client.query(
            "SELECT * FROM promocode WHERE title = $1 AND isActive = true",
            [data.promocode]
          );

          let users_id = [];
          let usedCount = getPromo.rows[0]?.usedcount + 1;
          if (
            getPromo.rows[0].users_id !== undefined &&
            getPromo.rows[0].users_id?.length > 0
          ) {
            for (let i = 0; i < getPromo.rows[0].users_id.length; i++) {
              users_id.push(getPromo.rows[0].users_id[i]);
            }
            users_id.push(msg.from.id);
          } else {
            users_id.push(msg.from.id);
          }

          let updatePromo = await client.query(
            "UPDATE promocode SET usedCount = $1, users_id = $2 WHERE id = $3",
            [usedCount, users_id, getPromo.rows[0].id]
          );

          if (getPromo.rows[0].usage_limit == getPromo.rows[0].usedcount + 1) {
            let updatePromo = await client.query(
              "UPDATE promocode SET isActive = false WHERE id = $1",
              [getPromo.rows[0].id]
            );
          }
        }
        let getCount = await client.query("SELECT MAX(count) FROM orders");

        const token = process.env.TelegramApi;
        const chat_id = process.env.CHAT_ID;
        const message = `<b>Поступил заказ с Telegram бота:</b> ${
          getCount.rows[0].max
        } %0A
  <b>Имя клиента:</b> ${msg.from.first_name} %0A
  <b>Номер:</b> ${user.rows[0].phone_number}| @${msg.from.username} %0A
  <b>Сумма заказа:</b> ${data.total} UZS %0A
  <b>Адрес:</b> ${user.rows[0].user_location[0]}, ${
          user.rows[0].user_location[1]
        } (Локация после сообщения) %0A
          %0A
  <b>Оплате (${data.payment}) </b>%0A
  <b>Тип выдачи:</b> ${data.delivery} %0A
  <b>Комментарий: ${data.comment !== "" ? `${data.comment}` : "Нет"}</b> %0A
  %0A
  <b>Товары в корзине:</b> ${data.order_products.map((i, index) => {
    let text = ` %0A ${index + 1}. ${i.product_name} (${i.filling}) (${
      i.price
    } UZS  x${i.count})`;
    return text;
  })} %0A
        `;

        if (data.payment == "РауМе") {
          let price = data.order_products.map((p, index) => {
            let num = p.price.replace(/\D/g, "");
            var price = parseInt(num);

            return {
              label: `${p.product_name}`,
              amount: `${price * p.count * 100}`,
            };
          });

          let deliveryPrice = await client.query(
            "SELECT delivery_price FROM settings"
          );

          if (data.delivery == "Доставка") {
            price.push({
              label: "Доставка",
              amount: deliveryPrice.rows[0].delivery_price * 100,
            });
          }

          let send = await bot.sendInvoice(
            msg.chat.id,
            `Оформления заказа `,
            `Descripotion`,
            "Payload",
            "387026696:LIVE:64f8122708166ba0cd2ac698",
            "UZS",
            price
          );

          bot.on("pre_checkout_query", async (query) => {
            let answerCheckout = await bot.answerPreCheckoutQuery(
              query.id,
              true
            );
          });

          bot.on("successful_payment", async (msg) => {
            let create = await client.query(
              "INSERT INTO orders(products, total, user_id, username, phone_number, comment, payment_type, exportation) values($1, $2, $3, $4, $5, $6, $7, $8)",
              [
                data.order_products,
                `${data.total}`,
                msg.from.id,
                msg.from.first_name,
                user.rows[0].phone_number,
                data.comment,
                data.payment,
                data.delivery,
              ]
            );

            await axios.post(
              `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&parse_mode=html&text=${message}`
            );

            await axios.post(
              `https://api.telegram.org/bot${token}/sendLocation?chat_id=${chat_id}&latitude=${user.rows[0].user_location[0]}&longitude=${user.rows[0].user_location[1]}`
            );

            await bot.sendMessage(
              msg.chat.id,
              `Ваш заказ принят! Cкоро оператор свяжется с вами! Спасибо за доверие 😊
          Для нового заказа нажмите на кнопку "Отправить контакт"`,
              {
                reply_markup: JSON.stringify({
                  keyboard: [
                    [{ text: "Отправить контакт", request_contact: true }],
                  ],
                  resize_keyboard: true,
                }),
              }
            );
          });
        } else {
          await axios.post(
            `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&parse_mode=html&text=${message}`
          );

          await axios.post(
            `https://api.telegram.org/bot${token}/sendLocation?chat_id=${chat_id}&latitude=${user.rows[0].user_location[0]}&longitude=${user.rows[0].user_location[1]}`
          );

          await bot.sendMessage(
            msg.chat.id,
            `Ваш заказ принят! Cкоро оператор свяжется с вами! Спасибо за доверие 😊
          Для нового заказа нажмите на кнопку "Отправить контакт"`,
            {
              reply_markup: JSON.stringify({
                keyboard: [
                  [{ text: "Отправить контакт", request_contact: true }],
                ],
                resize_keyboard: true,
              }),
            }
          );
        }
      }
    } catch (error) {
      console.log("error ->", error);
    }
  }
});

app.use(loginRoute);
app.use(productRoute);
app.use(categoryRoute);
app.use(ordersRoute);
app.use(userRoute);
app.use(bannerRoute);
app.use(promoRoute);
app.use(newsletterRoute);

app.listen(port, () => {
  console.log(port);
});
