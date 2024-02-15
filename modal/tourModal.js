const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'Only 40 characters allowed'],
      minlength: [10, 'Minimum 10 characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      emum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'The difficulty must be one of these'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5.0, 'The max ratings is 5.0 '],
      min: [1.0, 'The min ratings is 1.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'The discount ({VALUE})should be lower than price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secretTour: { type: Boolean, default: false }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
/////////////////////////////////////////////////////////////////////

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

/////////////////////////////////////////////////////

// tourSchema.pre('save', function(next) {
//   this.slug = slugify(this.name);
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc,this);
//   console.log('The document is saved');
//   next();
// });

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Time take = ${Date.now() - this.start}`);
  next();
});

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
