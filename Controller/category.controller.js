import client from "../db/config.js";
import nodeGeocoder from "node-geocoder";

export const createCategory = async (req, res) => {
  let { category_name } = req.body;

  if (category_name == "" || category_name == undefined) {
    return res.status(400).json({
      msg: "title 404",
    });
  }

  await client.query("insert into category(category_name) values($1)", [
    category_name,
  ]);

  return res.status(200).json({
    msg: "Created!",
  });
};

export const deleteCategory = async (req, res) => {
  let { category_name } = req.body;

  if (category_name == "" || category_name == undefined) {
    return res.status(400).json({
      msg: "title 404",
    });
  }

  const deleteProduct = await client.query(
    "DELETE FROM product WHERE category_name = $1",
    [category_name]
  );

  const deleteCategory = await client.query(
    "DELETE FROM category WHERE category_name = $1",
    [category_name]
  );

  return res.status(200).json({
    msg: "Deleted!",
  });
};

export const getCategories = async (req, res) => {
  const category = await client.query("select * from category");
  return res.status(200).json({
    categories: category.rows,
  });
};

export const getOrders = async (req, res) => {
  const allOrders = [];
  const category = await client.query("select * from orders");

  for (let i = 0; i < category.rows.length; i++) {
    let res = {};
    res.count = category.rows[i].count;
    res.order_id = category.rows[i].order_id;
    res.user_id = category.rows[i].user_id;
    res.username = category.rows[i].username;
    res.phone_number = category.rows[i].phone_number;
    res.total = category.rows[i].total;
    res.products = category.rows[i].products;
    res.comment = category.rows[i].comment;
    res.payment_type = category.rows[i].payment_type;
    res.exportation = category.rows[i].exportation;
    res.created_at = category.rows[i].created_at;

    let getUser = await client.query("SELECT * from users WHERE user_id = $1", [
      res.user_id,
    ]);

    const location = "";
    let options = {
      provider: "openstreetmap",
    };

    let geoCoder = nodeGeocoder(options);
    await geoCoder
      .reverse({
        lat: getUser.rows[0].user_location[0],
        lon: getUser.rows[0].user_location[1],
      })
      .then((res) => {
        let find = res[0].formattedAddress
          .split(",")
          .filter((p, index) => p.includes("Tumani") == true);
        let resLocation = `${res[0].country}, ${res[0].city}, ${find[0]}, ${res[0].streetName}, ${res[0].neighbourhood}`;

        console.log(resLocation);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return res.status(200).json({
    orders: category.rows,
  });
};

// {
// count: 1,
// order_id: '27d22598-51c6-4576-9a2b-4dc629f76eb4',
// user_id: '609736291',
// username: 'Farrux',
// phone_number: '998903152006',
// total: '99 000',
// products: [
//   '{"product_id":"262ce2c1-ab2c-4df5-b810-e999bd265042","product_name":"СЛИВОЧНАЯ","price":"80 000","count":1}'
// ],
// comment: '',
// payment_type: 'Наличные',
// exportation: 'Доставка',
// created_at: 2023-08-28T20:12:47.804Z
// }
