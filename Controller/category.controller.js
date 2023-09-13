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
  const location = [];

  let options = {
    provider: "openstreetmap",
  };

  const allOrders = [];
  const category = await client.query("select * from orders");
  console.log(category.rows[0]);
  for (let i = 0; i < category.rows.length; i++) {
    let res = {};
  }

  return res.status(200).json({
    orders: category.rows,
  });
};
