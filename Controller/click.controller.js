import client from "../db/config.js";

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

  const products = [JSON.parse(getOrder.rows[0].products)];
  console.log(getOrder.rows[0].products);
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
  <b>Оплате (${getCount.rows[0].payment_type}) </b>%0A
  <b>Тип выдачи:</b> ${getCount.rows[0].exportation} %0A
  <b>Комментарий: ${
    getCount.rows[0].comment !== "" ? `${getCount.rows[0].comment}` : "Нет"
  }</b> %0A
  %0A
  <b>Сумма заказа:</b> ${
    getCount.rows[0].exportation == "Доставка"
      ? `${(getCount.rows[0].total - resDeliveryPrice).toLocaleString()}`
      : `${(getCount.rows[0].total + 0).toLocaleString()}`
  } UZS %0A
  <b>Доставка:</b> ${
    getCount.rows[0].exportation == "Доставка"
      ? ` ${resDeliveryPrice?.toLocaleString()} (${dist} km)`
      : "Самовызов"
  }%0A
  <b>Итого:</b> ${(getCount.rows[0].total + 0).toLocaleString()} UZS%0A
  %0A
  <b>Товары в корзине:</b> ${products.map((i, index) => {
    let text = ` %0A ${index + 1}. ${i.product_name} (${i.filling}) (${
      i.price
    } UZS  x${i.count})`;
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
    msg.chat.id,
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
