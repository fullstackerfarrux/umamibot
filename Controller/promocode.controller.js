import client from "../db/config.js";

export const createPromo = async (req, res) => {
  let { promo_name, percent, initial_amount, limit } = req.body;

  if (promo_name == "" || promo_name == undefined) {
    return res.status(400).json({
      msg: "promo_name 404",
    });
  }

  let date = new Date();
  let now = `${date.getDate()}.${
    date.getMonth() > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`
  }.${date.getFullYear()}`;

  let create = await client.query(
    "INSERT INTO promocode(title, sale, initial_amount, usage_limit, isActive, created_at) values($1, $2, $3, $4, $5, $6)",
    [promo_name, percent, initial_amount, limit, true, now]
  );

  return res.status(200).json({
    msg: "Created!",
  });
};

export const getPromo = async (req, res) => {
  let getAll = await client.query("SELECT * FROM promocode");

  return res.status(200).json({
    data: getAll.rows,
  });
};

export const deletePromo = async (req, res) => {
  let { id } = req.body;

  const deletePromo = await client.query(
    "UPDATE promocode SET isActive = false WHERE id = $1",
    [id]
  );

  return res.status(200).json({
    msg: "Updated!",
  });
};
