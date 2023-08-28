import client from "../db/config.js";

export const createCategory = async (req, res) => {
  let { category_name } = req.body;
  console.log(category_name);

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

export const getCategories = async (req, res) => {
  const category = await client.query("select * from category");
  return res.status(200).json({
    categories: category.rows,
  });
};

export const getOrders = async (req, res) => {
  const category = await client.query("select * from orders");

  return res.status(200).json({
    orders: category.rows,
  });
};
