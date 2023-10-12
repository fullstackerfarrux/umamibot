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
import clickRoute from "./Router/click.route.js";

const app = express();
app.use(cors());
app.use(
  express.urlencoded({
    extended: false,
    limit: 10000,
    parameterLimit: 2,
  })
);
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
  const find = await client.query(
    "select * from users where phone_number = $1",
    [msg.contact.phone_number]
  );

  if (find.rowCount == 0) {
    let username = msg.chat.username !== undefined ? msg.chat.username : "";

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

    bot.sendMessage(msg.chat.id, `Пожалуйста отправьте геопозицию`, {
      reply_markup: JSON.stringify({
        keyboard: [[{ text: "Отправить геопозицию", request_location: true }]],
        resize_keyboard: true,
      }),
    });
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

        if (data.payment !== "Click") {
          let create = await client.query(
            "INSERT INTO orders(products, total, user_id, username, phone_number, comment, payment_type, exportation, payment_status) values($1, $2, $3, $4, $5, $6, $7, $8, $9)",
            [
              data.order_products,
              `${data?.total}`,
              msg.from.id,
              msg.from.first_name,
              user.rows[0].phone_number,
              data.comment,
              data.payment,
              data.delivery,
              true,
            ]
          );
        } else {
          let create = await client.query(
            "INSERT INTO orders(products, total, user_id, username, phone_number, comment, payment_type, exportation, payment_status) values($1, $2, $3, $4, $5, $6, $7, $8, $9)",
            [
              data.order_products,
              `${data?.total}`,
              msg.from.id,
              msg.from.first_name,
              user.rows[0].phone_number,
              data.comment,
              data.payment,
              data.delivery,
              false,
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

        let startSum = 10000;
        let kmSum = 2000;

        // Convert from degrees to radians
        function degreesToRadians(degrees) {
          var radians = (degrees * Math.PI) / 180;
          return radians;
        }

        // Function takes two objects, that contain coordinates to a starting and destination location.
        function calcDistance(startingCoords, destinationCoords) {
          let startingLat = degreesToRadians(startingCoords.latitude);
          let startingLong = degreesToRadians(startingCoords.longitude);
          let destinationLat = degreesToRadians(destinationCoords.latitude);
          let destinationLong = degreesToRadians(destinationCoords.longitude);

          // Radius of the Earth in kilometers
          let radius = 6571;

          // Haversine equation
          let distanceInKilometers =
            Math.acos(
              Math.sin(startingLat) * Math.sin(destinationLat) +
                Math.cos(startingLat) *
                  Math.cos(destinationLat) *
                  Math.cos(startingLong - destinationLong)
            ) * radius;

          return distanceInKilometers;
        }

        let sCoords = {
          latitude: 41.302626,
          longitude: 69.279813,
        };

        let dCoords = {
          latitude: user.rows[0].user_location[0],
          longitude: user.rows[0].user_location[1],
        };

        let dist = Math.round(calcDistance(sCoords, dCoords));
        let resDeliveryPrice = dist * kmSum + startSum;

        const token = process.env.TelegramApi;
        const chat_id = process.env.CHAT_ID;
        const message = `<b>Поступил заказ с Telegram бота:</b> ${
          getCount.rows[0].max
        } %0A
  <b>Имя клиента:</b> ${msg.from.first_name} %0A
  <b>Номер:</b> ${user.rows[0].phone_number} ${
          msg.from.username !== undefined ? `| @${msg.from.username}` : ""
        }%0A
  <b>Адрес:</b> ${user.rows[0].reverse_location} (Локация после сообщения) %0A
          %0A
  <b>Дистанция:</b> ${dist}km%0A
  <b>Оплате (${data.payment}) </b>%0A
  <b>Тип выдачи:</b> ${data.delivery} %0A
  <b>Комментарий: ${data.comment !== "" ? `${data.comment}` : "Нет"}</b> %0A
  %0A
  <b>Сумма заказа:</b> ${
    data.delivery == "Доставка"
      ? `${(data?.total - resDeliveryPrice).toLocaleString()}`
      : `${(data?.total + 0).toLocaleString()}`
  } UZS %0A
  <b>Доставка:</b> ${
    data.delivery == "Доставка"
      ? ` ${resDeliveryPrice?.toLocaleString()} (${dist} km)`
      : "Самовызов"
  }%0A
  <b>Итого:</b> ${(data?.total + 0).toLocaleString()} UZS%0A
  %0A
  <b>Товары в корзине:</b> ${data.order_products.map((i, index) => {
    let text = ` %0A ${index + 1}. ${i.product_name} (${i.filling}) (${
      i.price
    } UZS  x${i.count})`;
    return text;
  })} %0A
        `;

        if (data.payment == "Click") {
          const order = await client.query(
            "SELECT * FROM orders WHERE user_id = $1",
            [msg.from.id]
          );

          var num = order.rows[order.rows.length - 1].total.replaceAll(
            /\D/g,
            ""
          );
          var resTotal = parseInt(num);

          bot.sendMessage(msg.chat.id, `Оформления заказа`, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: `Оплатить`,
                    url: `https://my.click.uz/services/pay?service_id=${29813}&merchant_id=${22179}&amount=${1000}&transaction_param=${
                      order.rows[order.rows.length - 1].order_id
                    }`,
                  },
                ],
              ],
              resize_keyboard: true,
            },
          });

          //   await axios.post(
          //     `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&parse_mode=html&text=${message}`
          //   );

          //   await axios.post(
          //     `https://api.telegram.org/bot${token}/sendLocation?chat_id=${chat_id}&latitude=${user.rows[0].user_location[0]}&longitude=${user.rows[0].user_location[1]}`
          //   );

          //   await bot.sendMessage(
          //     msg.chat.id,
          //     `Ваш заказ принят! Cкоро оператор свяжется с вами! Спасибо за доверие 😊
          // Для нового заказа нажмите на кнопку "Отправить контакт"`,
          //     {
          //       reply_markup: JSON.stringify({
          //         keyboard: [
          //           [{ text: "Отправить контакт", request_contact: true }],
          //         ],
          //         resize_keyboard: true,
          //       }),
          //     }
          //   );
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
app.use(clickRoute);

app.listen(port, () => {
  console.log(port);
});
