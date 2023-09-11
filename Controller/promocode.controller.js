import client from "../db/config.js";

export const createPromo = async (req, res) => {
  let { promo_name, percent, initial_amount } = req.body;

  if (promo_name == "" || promo_name == undefined) {
    return res.status(400).json({
      msg: "promo_name 404",
    });
  }

  let create = await client.query(
    "INSERT INTO promocode(title, sale, initial_amount) values($1, $2, $3)",
    [promo_name, percent, initial_amount]
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
