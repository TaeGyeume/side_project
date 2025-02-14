const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    types: [
      {
        type: String,
        enum: ['flight', 'accommodation', 'tourTicket', 'travelItem'],
        required: true
      }
    ],
    productIds: [
      {type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'types'}
    ],
    roomIds: [{type: mongoose.Schema.Types.ObjectId, ref: 'Room'}],
    startDates: [{type: Date}],
    endDates: [{type: Date}],
    counts: [{type: Number, required: true}],
    merchant_uid: {type: String, required: true},
    totalPrice: {type: Number, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User'},
    reservationInfo: {
      name: String,
      email: String,
      phone: String,
      address: String
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'CANCELED', 'CONFIRMED'],
      default: 'PENDING'
    },
    createdAt: {type: Date, default: () => new Date(Date.now() + 9 * 60 * 60 * 1000)},
    updatedAt: {type: Date, default: () => new Date(Date.now() + 9 * 60 * 60 * 1000)}
  },
  {timestamps: false}
);

module.exports = mongoose.model('Booking', bookingSchema);
