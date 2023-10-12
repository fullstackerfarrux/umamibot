import client from "../db/config.js";

export const clickPrepare = async (req, res) => {
  let {
    click_trans_id,
    service_id,
    click_paydoc_id,
    merchant_trans_id,
    amount,
    action,
    error,
    error_note,
    sign_time,
    sign_string,
  } = req.body;

  console.log(req.body);

  console.log("keldi", click_trans_id);

  const getOrder = await client.query(
    "SELECT * FROM orders WHERE order_id = $1",
    [merchant_trans_id]
  );

  console.log(getOrder.rows);

  if (getOrder.rows.length <= 0) {
    return res.status(400).json({
      error: 1,
    });
  }

  console.log("prepared");

  return res.json({
    click_trans_id,
    merchant_trans_id,
    merchant_prepare_id: 123,
    error: 0,
    error_note: "",
  });
};

// export const clickComplete = async (req, res) => {
//   let {
//     click_trans_id,
//     service_id,
//     click_paydoc_id,
//     merchant_trans_id,
//     amount,
//     action,
//     error,
//     error_note,
//     sign_time,
//     sign_string,
//   } = req.body;

//   const getOrder = await client.query(
//     "SELECT * FROM orders WHERE order_id = $1",
//     [merchant_trans_id]
//   );

//   if (getOrder.rows.length <= 0) {
//     return res.status(400).json({
//       error: 1,
//     });
//   }

//   const updateOrder = await client.query(
//     "UPDATE orders SET payment_status = true WHERE order_id = $1",
//     [merchant_trans_id]
//   );

//   console.log("completed");

//   return res.json({
//     click_trans_id,
//     merchant_trans_id,
//     merchant_prepare_id: 123,
//     error: 0,
//     error_note: "",
//   });
// };
