// const fs = require('fs');
// let tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// Check Id
// exports.checkId = (req, res, next, val) => {
//   if (req.params.id * 1 > tours.length - 1) {
//     return res.status(404).json({ status: 'fail', message: 'INVALID ID' });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   // if (!req.body.name || !req.body.price) {
//   //   return res.status(404).send('Bad Request');
//   // }
//   console.log(req.body)
//   next()
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };

const AppError = require('../utility/appError.js');
const Tour = require('./../modal/tourModal.js');
const ApiFeatures = require('./../utility/apiFeatures.js');
const catchAsync = require('./../utility/catchAsync.js');

//Route Handler Functions for Tours

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  console.log(req.query);
  next();
};

////////// PIPE AGG
exports.getStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        maxPrice: { $max: '$price' },
        minPrice: { $min: '$price' }
      }
    },
    { $sort: { avgPrice: 1 } }
  ]);
  res.status(200).json({ status: 'success', data: stats });
});

exports.getMonthlyTours = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const toursMonthly = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        count: { $sum: 1 },
        tournames: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    { $project: { _id: 0 } },
    { $sort: { count: -1 } }
  ]);
  // console.log(toursMonthly);
  res.status(200).json({ status: 'success', data: toursMonthly });
});

/// CLASS API Features

exports.getAllTours = catchAsync(async (req, res, next) => {
  // console.log(req.query);
  // Another method
  // const tours = await Tour.find()
  //   .where('difficulty')
  //   .equals('easy');

  ///////////////////////////// FILTERING

  // const queryObj = { ...req.query };
  // // Removing some option from queryObj
  // const excludedList = ['page', 'sort', 'limit', 'fields'];
  // excludedList.forEach(el => {
  //   delete queryObj[el];
  // });

  // // Add the $ dollar sign for advanced filtering
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

  // // console.log(queryStr, req.query.limit);
  // let query = Tour.find(JSON.parse(queryStr));

  //////////////////////// Sorting

  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   query = query.sort(sortBy);
  // } else {
  //   query = query.sort('_id');
  // }

  ////////////////// Fields

  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   // console.log(fields);
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v');
  // }
  // console.log(query);

  /////////////////// Pagination

  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 2;
  // const skip = (page - 1) * limit;

  // query = query.skip(skip).limit(limit);

  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments();
  //   if (skip >= numTours) {
  //     throw new Error('This page does not exist');
  //   }
  // }

  const features = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitingFields()
    .pagination();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    time: req.requestedTime,
    result: tours.length,
    data: { tours }
  });
});

exports.getToursById = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError('no tour with this id', 404));
  }
  res.status(200).json({ status: 'success', data: { tour } });

  // const id = req.params.id * 1;
  // const tour = tours.find(el => el.id === id);
  // console.log(id, tour);
  //   if (!tour) {
  //     res.status(404).json({ status: 'fail', message: 'INVALID ID' });
  //   }
  // res.status(200).json({ status: 'success', data: { tour } });
});

exports.postTour = catchAsync(async (req, res, next) => {
  // const newId = tours[tours.length - 1].id + 1;
  // const newTour = Object.assign({ id: newId }, req.body);
  // tours.push(newTour);
  // fs.writeFile(
  //   `${__dirname}/../dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   err => {}
  // );

  const newTour = await Tour.create(req.body);

  res.status(201).json({ status: 'success', data: { newTour } });
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!tour) {
    return next(new AppError('no tour with this id', 404));
  }
  res.status(200).json({ status: 'success', data: { tour } });

  //  TRIAL I REPLACED THE TOURS ARR WITH THE ONE I SEND
  // const tour = tours.find(el=>el.id===req.params.id)
  // const tourId=req.params.id*1
  // tours.splice(tourId,1,req.body)
  // console.log(tours)
  // res.send('ok')
  //   if (req.params.id * 1 > tours.length - 1) {
  //     res.status(404).json({ status: 'fail', message: 'INVALID ID' });
  //   }
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  // await Tour.findByIdAndDelete(req.params.id);
  const deletedTour = await Tour.findByIdAndDelete(req.params.id);
  console.log(deletedTour); // Check the deletedTour value
  if (!deletedTour) {
    return next(new AppError('no tour with this id', 404));
  }

  res.status(204).json({ status: 'success', data: null });
});
