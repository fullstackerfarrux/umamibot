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
