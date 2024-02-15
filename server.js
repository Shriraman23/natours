const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB connected');
  });

// const testTour = new Tour({
//   name: 'The Forest Hiker',
//   rating: 4.7,
//   price: 497
// });
// testTour
//   .save()
//   .then(doc => {
//     console.log(doc);
//   })
//   .catch(err => {
//     console.log('ERROR:', err);
//   });

const port = process.env.PORT || 3000;
const app = require('./app.js');
// console.log(process.env)
const server = app.listen(port, () => {
  console.log('Server is listening on 3000');
});

process.on('unhandledRejection', err => {
  console.log('ERROR NAME-----', err.name);
  // console.log(err.message, err.name);

  server.close(() => {
    process.exit(1);
  });
});
// console.log(x)
