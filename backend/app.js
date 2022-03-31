
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

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

// 3) ROUTES
const userRouter = require('./routes/userRoutes');
const razorRouter = require('./routes/razorRoutes');

app.use('/api/v1/user', userRouter);
app.use('/api/v1/payment', razorRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
