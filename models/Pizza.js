// import the dependencies
const { Schema, model } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const PizzaSchema = new Schema(
  // 1st parameter: object properties
  {
    pizzaName: {
      type: String
    },
    createdBy: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: (createdAtVal) => dateFormat(createdAtVal)
    },
    size: {
      type: String,
      default: 'Large'
    },
    toppings: [],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
      }
    ]
  },
  // 2nd parameter: object constraints/abilities
  {
    toJSON: {
      virtuals: true,
      getters: true
    },
    id: false
  }
);

// get total count of comments and replies on retrieval
PizzaSchema.virtual('commentCount').get(function () {
  return this.comments.reduce((total, comment) => total + comment.replies.length + 1, 0);
});

// create the Pizza model using the PizzaSchema
const Pizza = model('Pizza', PizzaSchema);

// export the Pizza model
module.exports = Pizza;

// Virtuals allow you to add virtual properties to a document that aren't stored in the database. 
// They're normally computed values that get evaluated when you try to access their properties.
// Virtuals allow us to add more information to a database response so that we don't have 
// to add in the information manually with a helper before responding to the API request.

// ----------------line 43----------------
// In its basic form, .reduce() takes two parameters, an accumulator and a currentValue. 
// Here, the accumulator is total, and the currentValue is comment. As .reduce() walks through 
// the array, it passes the accumulating total and the current value of comment into the function, 
// with the return of the function revising the total for the next iteration through the array.