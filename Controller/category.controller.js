import client from "../db/config.js";

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
    let getUser = await client.query("SELECT * from users WHERE user_id = $1", [
      category.rows[i].user_id,
    ]);

    let res = {
      count: category.rows[i].count,
      order_id: category.rows[i].order_id,
      user_id: category.rows[i].user_id,
      username: category.rows[i].username,
      phone_number: category.rows[i].phone_number,
      total: category.rows[i].total,
      products: category.rows[i].products,
      comment: category.rows[i].comment,
      payment_type: category.rows[i].payment_type,
      exportation: category.rows[i].exportation,
      created_at: category.rows[i].created_at,
      location:
        getUser.rows[0]?.reverse_location !== undefined
          ? getUser.rows[0]?.reverse_location
          : "",
    };

    console.log(res.location);

    allOrders.push(res);
  }

  return res.status(200).json({
    orders: allOrders,
  });
};
