const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Start express app
const app = express();

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

//Setting view enging

app.set('view engine', 'ejs');

//Routes
app.get('/payments', (req, res) => {
  res.render('payment', { key: process.env.RAZORPAY_KEY_ID });
});
app.post('/api/payment/order', (req, res) => {
  instance.orders
    .create(req.body)
    .then(data => {
      res.send({ sub: data, status: 'success' });
    })
    .catch(error => {
      res.send({ sub: error, status: 'fail' });
    });
});

app.post('/api/payment/verify', (req, res) => {
  const body = `${req.body.razorpay_order_id}|${req.body.razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');
  console.log(`sig ${req.body.razorpay_signature}`);
  console.log(`sig'  ${expectedSignature}`);
  if (expectedSignature === req.body.razorpay_signature) {
    res.send({ status: 'success' });
  } else {
    res.send({ status: 'fail' });
  }
});

// 3) ROUTES
const userRouter = require('./routes/userRoutes');

app.use('/api/v1/user', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
