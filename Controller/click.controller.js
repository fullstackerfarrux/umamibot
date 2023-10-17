import axios from "axios";
import client from "../db/config.js";
import TelegramBot from "node-telegram-bot-api";

export const clickPrepare = async (req, res) => {
  let {
    click_trans_id,
    service_id,
    click_paydoc_id,
    merchant_trans_id,
    amount,
    action,
    error,
    error_note,
    sign_time,
    sign_string,
  } = req.body;

  const getOrder = await client.query(
    "SELECT * FROM orders WHERE order_id = $1",
    [merchant_trans_id]
  );

  if (getOrder.rows.length <= 0) {
    return res.json({
      error: -5,
      error_note: "",
    });
  }

  if (getOrder.rows[0].total !== amount) {
    return res.json({
      error: -2,
      error_note: "",
    });
  }

  if (getOrder.rows[0].payment_status == true) {
    return res.json({
      error: -4,
      error_note: "",
    });
  }

  return res.json({
    click_trans_id,
    merchant_trans_id,
    merchant_prepare_id: 123,
    error: 0,
    error_note: "",
  });
};

export const clickComplete = async (req, res) => {
  const bot = new TelegramBot(process.env.TelegramApi);
  let {
    click_trans_id,
    service_id,
    click_paydoc_id,
    merchant_trans_id,
    amount,
    action,
    error,
    error_note,
    sign_time,
    sign_string,
  } = req.body;

  const getOrder = await client.query(
    "SELECT * FROM orders WHERE order_id = $1",
    [merchant_trans_id]
  );
  let getPromo = await client.query(
    "SELECT * FROM promocode WHERE isActive = true AND usedCount > 0"
  );
  let resPromoSale = "";
  let resPromoTitle = "";

  for (let i = 0; i > getPromo.rows?.length; i++) {
    for (let j = 0; i > getPromo.rows[i].orders_id; i++) {
      if (getPromo.rows[i].orders_id[j] == merchant_trans_id) {
        resPromoSale = `${getPromo.rows[i].sale}`;
        resPromoTitle = `${getPromo.rows[i].title}`;
      }
    }
  }

  if (getOrder.rows.length <= 0) {
    return res.json({
      error: -5,
      error_note: "",
    });
  }

  if (getOrder.rows[0].payment_status == true) {
    return res.json({
      error: -4,
      error_note: "",
    });
  }

  const token = process.env.TelegramApi;
  const chat_id = process.env.CHAT_ID;
  let user = await client.query("SELECT * FROM users where user_id = $1", [
    getOrder.rows[0].user_id,
  ]);
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

  let products = [];
  for (let p = 0; p < getOrder.rows[0].products.length; p++) {
    let productToJson = JSON.parse(getOrder.rows[0].products[p]);
    products.push(productToJson);
  }

  const message = `<b>Поступил заказ с Telegram бота:</b> ${
    getCount.rows[0].max
  } %0A
  <b>Имя клиента:</b> ${user.rows[0].firstname} %0A
  <b>Номер:</b> ${user.rows[0].phone_number} ${
    user.rows[0].username !== undefined ? `| @${user.rows[0].username}` : ""
  }%0A
  <b>Адрес:</b> ${user.rows[0].reverse_location} (Локация после сообщения) %0A
          %0A
  <b>Дистанция:</b> ${dist}km%0A
  <b>Оплате (${getOrder.rows[0].payment_type}) </b>%0A
  <b>Тип выдачи:</b> ${getOrder.rows[0].exportation} %0A
  <b>Комментарий: ${
    getOrder.rows[0].comment !== "" ? `${getOrder.rows[0].comment}` : "Нет"
  }</b> %0A
   <b>Промкод: ${
     resPromoTitle !== ""
       ? `${resPromoTitle} - ${resPromoSale}`
       : "Не использован"
   }</b> %0A
  %0A
  <b>Сумма заказа:</b> ${
    getOrder.rows[0].exportation == "Доставка"
      ? `${(+getOrder.rows[0].total - resDeliveryPrice).toLocaleString()}`
      : `${(+getOrder.rows[0].total + 0).toLocaleString()}`
  } UZS %0A
  <b>Доставка:</b> ${
    getOrder.rows[0].exportation == "Доставка"
      ? ` ${resDeliveryPrice?.toLocaleString()} (${dist} km)`
      : "Самовызов"
  }%0A
  <b>Итого:</b> ${(+getOrder.rows[0].total + 0).toLocaleString()} UZS%0A
  %0A
  <b>Товары в корзине:</b> ${products.map((i, index) => {
    let text = ` %0A ${index + 1}. ${i.product_name} ${
      i.filling !== "" ? `(${i.filling})` : ``
    } %0A 
    ${i.count} x ${i.price.replace(/\D/g, " ")} = ${
      i.price.replace(/\D/g, "") * i.count
    }`;
    return text;
  })} %0A
        `;

  const updateOrder = await client.query(
    "UPDATE orders SET payment_status = true WHERE order_id = $1",
    [merchant_trans_id]
  );

  await axios.post(
    `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&parse_mode=html&text=${message}`
  );

  await axios.post(
    `https://api.telegram.org/bot${token}/sendLocation?chat_id=${chat_id}&latitude=${user.rows[0].user_location[0]}&longitude=${user.rows[0].user_location[1]}`
  );

  await bot.sendMessage(
    user.rows[0].chat_id,
    `Ваш заказ успешно оплачено! Cкоро оператор свяжется с вами! Спасибо за доверие 😊
          Для нового заказа нажмите на кнопку "Отправить контакт"`,
    {
      reply_markup: JSON.stringify({
        keyboard: [[{ text: "Отправить контакт", request_contact: true }]],
        resize_keyboard: true,
      }),
    }
  );

  return res.json({
    click_trans_id,
    merchant_trans_id,
    merchant_prepare_id: 123,
    error: 0,
    error_note: "",
  });
};
