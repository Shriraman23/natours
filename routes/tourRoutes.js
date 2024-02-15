const express = require('express');
const tourController = require('./../controllers/tourController.js');
const authController = require('./../controllers/authController.js');

const router = express.Router();

// router.param('id',tourController.checkId);

// router.use(
//   '/top-5-cheap',
//   tourController.aliasTopTours,
//   tourController.getAllTours
// );

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getStats);
router.route('/get-monthly-tours/:year').get(tourController.getMonthlyTours);

router
  .route('/')
  .post(tourController.postTour)
  .get(authController.protect, tourController.getAllTours);
router
  .route('/:id?')
  .get(tourController.getToursById)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
