const express = require('express');

const morgan = require('morgan');

const app = express();

const tourRouter = require(`${__dirname}/routes/tourRoutes.js`);
const userRouter = require(`${__dirname}/routes/userRoutes.js`);

const AppError = require('./utility/appError.js');
const globalErrorhandler = require('./controllers/errorController.js');

app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Mounting router to routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

///// Undefined roots
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Cannot find ${req.originalUrl} on the server`
  // });
  ///////////////////////////////////////////////////
  // const err = new Error(`Cannot find ${req.originalUrl} on the server`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`Cannot find ${req.originalUrl} on the server`));
});
/// Global error handlers

app.use(globalErrorhandler);

module.exports = app;

// Using Middleware

// app.use((req, res, next) => {
//   req.requestedTime = new Date().toISOString();
//   next();
// });
//  Routing Tours

// app.post('/api/v1/tours', postTour);
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id?', getToursById);
// app.patch('/api/v1/tours/:id?', updateTour);
// app.delete('/api/v1/tours/:id?', deleteTour);

// tourRouter.route('/').post(postTour).get(getAllTours);
// tourRouter
//   .route('/:id?')
//   .get(getToursById)
//   .patch(updateTour)
//   .delete(deleteTour);
