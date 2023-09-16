import client from "../db/config.js";

export const getUser = async (req, res) => {
  let { id } = req.params;

  const user = await client.query("select * from users where user_id = $1", [
    id,
  ]);

  return res.status(200).json({
    user: user.rows[0].firstname,
  });
};

export const getUsers = async (req, res) => {
  const user = await client.query("select * from users");

  return res.status(200).json({
    users: user.rows,
  });
};

export const getUsersOrder = async (req, res) => {
  const users = await client.query("select * from users");

  let reversedUsers = [];
  for (let i = 0; i < users.rows?.length; i++) {
    let getOrders = await client.query(
      "SELECT * FROM orders WHERE user_id = $1",
      [users.rows[i].user_id]
    );

    let res = {
      id: users.rows[i].user_id,
      created_date: new Date(Date.parse(users.rows[i].created_at)),
      username: users.rows[i].username,
      phone_number: users.rows[i].phone_number,
      orders_count: getOrders.rowCount,
    };

    reversedUsers.unshift(res);
  }

  return res.status(200).json({
    users: reversedUsers,
  });
};
