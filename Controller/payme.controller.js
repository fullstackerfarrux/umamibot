import axios from "axios";
import client from "../db/config.js";
import TelegramBot from "node-telegram-bot-api";

export const accept_order = async (req, res) => {
    const bot = new TelegramBot(process.env.TelegramApi);
    let {
      order_id
    } = req.body;
  
    const getOrder = await client.query(
      "SELECT * FROM orders WHERE order_id = $1",
      [order_id]
    );
    let getPromo = await client.query(
      "SELECT * FROM promocode WHERE isActive = true AND usedCount > 0"
    );
    let resPromoSale = "";
    let resPromoTitle = "";
  
    for (let i = 0; i < getPromo.rows?.length; i++) {
      for (let j = 0; j < getPromo.rows[i]?.orders_id?.length; j++) {
        if (getPromo.rows[i].orders_id[j] == order_id) {
          resPromoSale = `${getPromo.rows[i].sale}`;
          resPromoTitle = `${getPromo.rows[i].title}`;
        }
      }
    }
  
    if (getOrder.rows.length <= 0) {
      return res.json({
        error: -1,
      });
    }
  
    if (getOrder.rows[0].payment_status == true) {
      return res.json({
        error: -1,
      });
    }
  
    const token = process.env.TelegramApi;
    const chat_id = process.env.CHAT_ID;
    let user = await client.query("SELECT * FROM users where user_id = $1", [
      getOrder.rows[0].user_id,
    ]);
    let getCount = await client.query("SELECT MAX(count) FROM orders");
    let startSum = 30000;
    let kmSum = 0;
  
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
      latitude: 41.308240,
      longitude: 69.268835,
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
  
    console.log("respromotitle", resPromoTitle);
  
    const message = `<b>Поступил заказ с Telegram бота:</b> ${
      getCount.rows[0].max
    } 
<b>Имя клиента:</b> ${user.rows[0].firstname} 
<b>Номер:</b> ${user.rows[0].phone_number} ${
  user.rows[0].username !== undefined ? `| @${user.rows[0].username}` : ""
}
<b>Адрес:</b> ${user.rows[0].reverse_location} (Локация после сообщения) 
        
<b>Дистанция:</b> ${dist}km
<b>Оплате (${getOrder.rows[0].payment_type}) </b>
<b>Тип выдачи:</b> ${getOrder.rows[0].exportation} 
<b>Комментарий: ${
  getOrder.rows[0].comment !== "" ? `${getOrder.rows[0].comment}` : "Нет"
}</b> 
 <b>Промкод: ${
   resPromoTitle !== ""
     ? `${resPromoTitle} - ${resPromoSale}`
     : "Не использован"
 }</b> 

<b>Сумма заказа:</b> ${
  getOrder.rows[0].exportation == "Доставка"
    ? `${(+getOrder.rows[0].total - resDeliveryPrice).toLocaleString()}`
    : `${(+getOrder.rows[0].total + 0).toLocaleString()}`
} UZS 
<b>Доставка:</b> ${
  getOrder.rows[0].exportation == "Доставка"
    ? ` ${resDeliveryPrice?.toLocaleString()} (${dist} km)`
    : "Самовызов"
}
<b>Итого:</b> ${(+getOrder.rows[0].total + 0).toLocaleString()} UZS

<b>Товары в корзине:</b> ${products.map((i, index) => {
  let text = `
  ${index + 1}. ${i.product_name} ${
    i.filling !== "" ? `(${i.filling})` : ``
  }  
     ${i.count} x ${i.price.replace(/\D/g, " ")} = ${
    i.price.replace(/\D/g, "") * i.count
  }`;
  return text;
})} 
      `;
  
    const updateOrder = await client.query(
      "UPDATE orders SET payment_status = true WHERE order_id = $1",
      [order_id]
    );
  
    // await axios.post(
    //   `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chat_id}&parse_mode=html&text=${message}`
    // );
    await bot.sendMessage(
      chat_id,
      message,
      {
        parse_mode: "HTML"
      }
    )
  
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
      success: 1,
      error: 0,
    });
  };