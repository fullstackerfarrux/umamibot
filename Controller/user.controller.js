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
      id: users[i].user_id,
      created_date: new Date(Date.parse(users[i].created_at)),
      username: users[i].username,
      phone_number: users[i].phone_number,
      orders_count: getOrders.rowCount,
    };

    reversedUsers.push(res);
  }

  return res.status(200).json({
    users: reversedUsers.rows,
  });
};
