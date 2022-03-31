const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = express.Router();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/order", (req, res) => {
  instance.orders
    .create(req.body)
    .then((data) => {
      res.send({ sub: data, status: "success" });
    })
    .catch((error) => {
      res.send({ sub: error, status: "fail" });
    });
});

router.post("/verify", (req, res) => {
  const body = `${req.body.razorpay_order_id}|${req.body.razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");
  console.log(`sig ${req.body.razorpay_signature}`);
  console.log(`sig'  ${expectedSignature}`);
  if (expectedSignature === req.body.razorpay_signature) {
    res.send({ status: "success" });
  } else {
    res.send({ status: "fail" });
  }
});

module.exports = router;
