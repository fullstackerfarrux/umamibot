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

    let date = new Date(Date.parse(users.rows[i].created_at));
    let day = date.getDate() > 9 ? `${date.getDate()}` : `0${date.getDate()}`;
    let month =
      date.getMonth() > 9
        ? `${date.getMonth() + 1}`
        : `0${date.getMonth() + 1}`;

    let year = `${date.getFullYear()}`;

    console.log(day);
    console.log(month);
    console.log(year);
    console.log(`${day}.${month}.${year}`);

    let res = {
      id: users.rows[i].user_id,
      created_date: str,
      username: users.rows[i].username,
      phone_number: users.rows[i].phone_number,
      orders_count: getOrders.rowCount,
      count: i + 1,
    };

    reversedUsers.unshift(res);
  }

  return res.status(200).json({
    users: reversedUsers,
  });
};
